import {Component, OnInit, ViewChild} from '@angular/core';
import {TaskService, STEP_FLAGS, DEFAULT_MQTT_TIMEOUT, MQTT_COMMANDS, MQTT_MODULES} from './services/task.service';
import { CommonService } from './services/common.service';
import { environment } from '@env/environment';
import { HttpService } from './services/http.service';
import {NzMessageService, NzModalService} from 'ng-zorro-antd';
import { SettingsService } from './services/settings.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SendmessageComponent} from './flow/step1_sendmessage/sendmessage.component';

// 任务组件下的子组件集合
export const TASK_FLOW = [
  SendmessageComponent
];

@Component({
  selector: 'app-home',
  templateUrl: './task.component.html',
  styleUrls: [
    './task.component.css'
  ]
})
export class TaskComponent implements OnInit {

  /**
   * 任务列表
   * @type {any[]}
   */
  list = [];

  // 获取子组件
  @ViewChild('photoViewer') photoViewer;
  @ViewChild('videoViewer') videoViewer;
  @ViewChild('liveStreamViewer') liveStreamViewer;

  constructor(
    public  ts:             TaskService,
    public  http:           HttpService,
    private cs:             CommonService,
    private msg:            NzMessageService,
    private settings:       SettingsService,
    private fb:             FormBuilder,
    private modal:          NzModalService,
  ) {
    // 启动倒计时
    setInterval(
      () => {
        if (this.ts.utils.countDown - 1 >= 0) {
          this.ts.flags.utils.showCountingDown = true;
          this.ts.utils.countDown--;
        } else {
          this.ts.flags.utils.showCountingDown = false;
        }
      },
      1000
    );
  }

  /**
   * 页面渲染之前的事件
   */
  ngOnInit() {

    // 登陆获取token NOTE 模拟业务登陆
    this.http.post(this.cs.getUrl(environment.REQ_URLS.auth.token), {
      username: 'test',
      password: '123'
    }).subscribe(
      (res: any) => {
        if (
          res.code !== environment.SERVICE_RES_CODES.ok ||
          res.data === undefined || res.data === null ||
          res.data.token === undefined || res.data.token === null
        ) {
          this.msg.warning('请求登陆失败! err: ' + res.msg);
        } else {
          // 设置请求头部的授权token
          this.http.headers['Authorization'] = 'Bearer web ' + res.data.token;

          // 获取当前管理员信息
          this.http.post(this.cs.getUrl(environment.REQ_URLS.user.current), null).subscribe(
            (cres: any) => {
              if (cres.code === environment.SERVICE_RES_CODES.ok && cres.data !== undefined && cres.data !== null) {
                // 赋值信息
                this.settings.user.id = cres.data.id;
                this.settings.user.name = cres.data.userName;
                this.settings.user.state = cres.data.onlineState;

                this.cs.log(this.settings.user);

                // 初始化当前管理员mqtt
                this.ts.initMqtt(cres.data.id);

                // 绑定跳转事件
                this.ts.onMsgCallbacks[MQTT_MODULES.app.A04_A05] = [(ares) => {
                  // 检查动作是否为回调响应
                  if (ares['action'] === 'msgCallback' &&
                    // 检查内容
                    ares['data'] !== undefined && ares['data'] !== null &&
                    // 匹配ack
                    ares['data']['ack'] === this.ts.msgQueue.ack) {
                    // 执行跳转
                    this.responsedJump();
                  } else {
                    this.msg.warning('解析客户终端数据失败! err: ' + ares['msg']);
                    // 释放android端响应loading
                    this.ts.flags.mqtt.waitResFromAndroidLoading = false;
                    // 关闭mask
                    this.ts.flags.mask.loading = false;
                  }
                }];
                // TODO 如果当前管理员状态为2(等待接单)或3(忙碌中), 则查询该管理员当前是否有正在的处理任务, 有则跳转至对应的界面

                // 加载列表
                this.load();

                // TEST 模拟设置当前处理的任务
                this.ts.current = {
                  'deviceNo': 'Y77EDSRTEV',
                  'marCode': '01KMKM35112',
                  'marName': '四川成都环球中心15楼测试门店管理门店方便中心',
                  'strAddr': '东莞东**********酒店首层',
                  'strCode': '210004',
                  'strName': '11域电观澜大道419号兴万达广场一楼东莞东坑十一号',
                  'taskId': 'Y77EDSRTEV1522244603815',
                  'taskState': '1',
                  'taskStep': '',
                  'clientId': this.ts.buildAndroidClientId('Y77EDSRTEV')
                };
                this.ts.step = STEP_FLAGS[1];

              } else {
                this.msg.warning('获取您当前的信息失败! err: ' + res.msg);
              }
            }
          );
        }
      }
    );

    // 加载列表 TODO 模拟业务状态下需先登陆后再获取列表; 生产环境需解注释下面代码
    // this.load();
    // TODO 绑定跳转事件

    // 绑定跳转事件
    /*this.ts.onMsgCallbacks['A04-A05'] = [(res) => {
      // 检查动作是否为回调响应
      if (res['action'] === 'msgCallback' &&
        // 检查内容
        res['data'] !== undefined && res['data'] !== null &&
        // 匹配ack
        res['data']['ack'] === this.ts.msgQueue.ack) {
        // 执行跳转
        this.responsedJump();
      } else {
        this.msg.warning('解析客户终端数据失败! err: ' + res['msg']);
        // 释放android端响应loading
        this.ts.flags.mqtt.waitResFromAndroidLoading = false;
        // 关闭mask
        this.ts.flags.mask.loading = false;
      }
    }];*/

    // 初始化拒绝表单
    this.refuseForm = this.fb.group({
      refuseReason: [null, [Validators.required]],
    });

    // 初始化图片, 视频, 直播的modal
    this.ts.data.photoViewer.modal = this.photoViewer;
    this.ts.data.photoViewer.modal = this.photoViewer;
    this.ts.data.ls.modal = this.liveStreamViewer;
  }

  /**
   * 加载列表数据
   */
  public load() {
    this.http.post(this.cs.getUrl(environment.REQ_URLS.task.getOnwerTaskList), null).subscribe((res: any) => {
      if (res.code === environment.SERVICE_RES_CODES.ok) {
        // 排序列表
        try {
          res.data.sort((a, b) => {
            return (new Date(b.createTime)).getTime() - (new Date(a.createTime)).getTime();
          });
          this.list = res.data;
        } catch (e) {
          this.cs.error(e);
        }
      } else {
        this.msg.warning('列表加载失败! err: ' + res.msg);
      }
    });
  }

  /**
   * 接受任务
   * @param {{any}} task    任务信息
   */
  public accept(task: any) {
    // 格式化Android终端mqtt地址
    task['clientId'] = this.ts.buildAndroidClientId(task['deviceNo']);
    // 赋值给当前的任务
    this.ts.startTask(task);
    // android端响应中
    this.ts.flags.mqtt.waitResFromAndroidLoading = true;
    // 打开mask
    this.ts.flags.mask.loading = true;
    // 发送命令
    this.ts.pushStepCommand(MQTT_MODULES.app.A04_A05);
    // 超时计时器
    this.ts.flags.mqtt.responseTimeout = setTimeout(() => {
      // 提示消息
      this.msg.warning('客户终端响应超时, 请重试!');
      // 释放android端响应loading
      this.ts.flags.mqtt.waitResFromAndroidLoading = false;
      // 关闭mask
      this.ts.flags.mask.loading = false;
      // 清空数据
      this.ts.current = undefined;
      // 刷新ack, 避免延迟数据跳转
      this.ts.msgQueue.ack = this.ts.mqtt.createACK();
    }, DEFAULT_MQTT_TIMEOUT);

    // TEST
    setTimeout(() => {
      this.responsedJump();
    }, 3000);
  }

  /**
   * 响应后跳转
   */
  public responsedJump() {
    // 释放android端响应loading
    this.ts.flags.mqtt.waitResFromAndroidLoading = false;
    // 清除定时器
    clearTimeout(this.ts.flags.mqtt.responseTimeout);

    // 设置管理员为忙碌(3)状态
    this.http.post(this.cs.getUrl(environment.REQ_URLS.user.updateUserOnlineState, {
      userId: this.settings.user.id,
      onlineState: environment.DICTIONARY.user.state.BUSY
    }), null).subscribe(
      (res: any) => {
        if (res.code === environment.SERVICE_RES_CODES.ok) {
          this.settings.user.state = environment.DICTIONARY.user.state.BUSY;
        } else {
          this.msg.warning('更改您当前的状态失败! err: ' + res.msg);
        }
      }
    );

    // 设置任务为处理状态
    this.http.post(this.cs.getUrl(environment.REQ_URLS.task.updateTaskState), {
      taskId: this.ts.current['taskId'],
      taskState: 2,
    }).subscribe(
      (res: any) => {
        if (res.code === environment.SERVICE_RES_CODES.ok) {
          // 关闭mask
          this.ts.flags.mask.loading = false;
          // 切换至 发送短信 界面
          this.ts.step = STEP_FLAGS[1];
        } else {
          this.msg.warning('操作任务状态失败! err: ' + res.msg);

          // QUESTION 是否需要向android端发送终止指令
        }
      }
    );
  }

  // region 拒绝任务

  /**
   * 拒绝任务表单对象
   */
  public refuseForm: FormGroup;

  /**
   * 拒绝表单弹窗
   */
  refuseFormBox: any;

  /**
   * 打开拒绝表单弹窗
   * @param content
   */
  openRefuseModal(content) {
    this.refuseFormBox = this.modal.open({
      title: '请输入您拒绝的理由',
      content: content,
      okText: '确定',
      cancelText: '取消',
      footer: false,
      maskClosable: false
    });
  }

  /**
   * 关闭拒绝表单弹窗
   */
  closeRefuseModal() {
    this.refuseFormBox.destroy();
  }

  /**
   * 提交拒绝理由
   * @param {string} refusedData
   */
  doRefuse(refusedData?: any) {
    // 获取数据
    const data = refusedData ? refusedData : this.refuseForm.getRawValue();
    // 发送数据
    this.http.post(this.cs.getUrl(environment.REQ_URLS.task.updateTaskState), {
      taskId: this.ts.current.taskId,
      isInvalid: environment.DICTIONARY.task.isInvalid.INVALID,
      taskState: environment.DICTIONARY.task.state.COMPLETED,
      remark: data.refuseReason
    }).subscribe(
      (res: any) => {
        if (res.code === environment.SERVICE_RES_CODES.ok) {

          // 如果是传参跳转, 则不向android端发送消息
          if (refusedData === undefined) {
            // 给android端跳转首页
            this.ts.push({
              module: MQTT_MODULES.web.common,
              action: MQTT_COMMANDS.instru,
              data: {
                command: 'missionFail',
              }
            });

            // 关闭拒绝理由弹窗
            this.closeRefuseModal();
          }

          // NOTE 清除当前任务信息 清除图片列表, 视频列表, 直播地址, 重置按钮状态等
          this.ts.cleanTask();
        } else {
          this.msg.warning('拒绝失败! err: ' + res.msg);
        }
      }
    );
  }

  // 封装
  get refuseReason() {
    return this.refuseForm.controls['refuseReason'];
  }

  // endregion

  // region 其他提供给页面方法

  /**
   * 获取步骤标识符
   * @param {number} index    步骤下标
   * @returns {string}
   */
  public steps(index: number) {
    return STEP_FLAGS[index];
  }

  // endregion

}

import {Injectable, Injector} from '@angular/core';
import {MyMqttService} from './myMqtt.service';
import {environment} from '@env/environment';
import {CommonService} from './common.service';
import {NzMessageService, NzModalService, NzNotificationService} from 'ng-zorro-antd';
import {MqttServiceOptions} from 'ngx-mqtt/src/mqtt.model';
import {HttpService} from './http.service';

/**
 * 步骤标识符
 * @type {string[]}
 */
export const STEP_FLAGS = [
  '',
  'task-send-message',
  'task-loan-trial',
  'task-ocr',
  'task-customer-basinInfo',
  'task-customer-unitInfo',
  'task-customer-productInfo',
  'task-customer-familyInfo',
  'task-customer-detailInfo'
];

/**
 * mqtt发送消息时候的命令
 * @type {{}}
 */
export const MQTT_COMMANDS = {
  instru:         'instru',
  step:           'step',
  sendData:       'sendData'
};

/**
 * 消息队列模块字典
 * @type {{}}
 */
export const MQTT_MODULES = {
  // 来自服务器
  server: {
    // 主要用的
    main: 'S01'
  },
  // 来自web端
  web: {
    // 公共模块通信
    common: 'W00'
  },
  // 来自Android终端
  app: {
    // 任务列表 跳转至 发送验证码界面
    A04_A05:      'A04-A05',
    // 发送验证码界面
    A05:          'A05',
    // 发送验证码界面 跳转至 试算
    A05_A06:      'A05-A06'
  }
};

/**
 * 默认mqtt等待时间, 单位毫秒(ms)
 * @type {number}
 */
export const DEFAULT_MQTT_TIMEOUT = 30000;

@Injectable()
export class TaskService {

  /**
   * mqtt事件集合; key为module的名称, value必须为Function
   * @type {{}}
   */
  public onMsgCallbacks = {};

  /**
   * 当前处理的任务; 必须包含taskId, deviceNo, clientId(p2p)
   * @type {{}}
   */
  public current: any = {
    // 必要内容
    // 任务id
    taskId:                 undefined,
    // 设备编号
    deviceNo:               undefined,
    // 客户终端mqtt地址
    clientId:               undefined,
    // 非必要, 仅供显示用
    // 商家名称
    marName:                undefined,
    // 门店名称
    strName:                undefined,
    // 门店地址
    strAddr:                undefined,
    // 标记的flag
    // 当前处理任务的状态
    taskStep:                   STEP_FLAGS[0],
  };

  /**
   * 当前的步骤
   * @type {string}
   */
  public step = STEP_FLAGS[0];

  /**
   * 当前任务标记的东西
   * @type {{}}
   */
  public flags = {
    // 全局loading
    loading:                    false,
    // 消息队列标识符
    mqtt: {
      // 等待Android终端相应时的loading
      waitResFromAndroidLoading:  false,
      // Android终端相应超时计时器标识符
      responseTimeout:            undefined
    },
    // 侧边工具栏
    utils: {
      // 侧边栏显示否
      show:                     false,
      // 是否显示倒计时
      showCountingDown:         false,
      // 终端摄像头正在使用中
      cameraInUsingLoading:     false,
      // 直播loading
      liveStreamBtnLoading:     false,
      // 抓拍图片loading
      photoBtnLoading:          false,
      // 抓拍视频loading
      videoBtnLoading:          false,
    },
    // 遮罩
    mask: {
      loading:                  false
    },
    // 任务
    task: {
      // 流程是否全部走完; 用于标记是否直接跳转至最后一页
      fullyProcessed:         false,
    }
  };

  /**
   * 侧边栏工具承载的对象
   * @type {{}}
   */
  public utils = {
    // 图片列表
    photoList:          [],
    // 视频列表
    videoList:          [],
    // 问题列表
    questionList:       [],
    // 倒计时
    countDown:          0
  };

  /**
   * 其他数据内容
   * @type {{}}
   */
  public data = {
    // 图片查看器
    photoViewer: {
      // 图片查看器modal
      modal:              undefined,
      // 图片地址
      url:                '',
    },
    // 视频查看器
    videoViewer: {
      // 视频查看器modal
      modal:              undefined,
      // 视频地址
      url:                '',
    },
    // 直播 living stream
    ls: {
      // 直播查看器modal
      modal:              undefined,
      // 直播播放地址
      url:                '',
      // 直播推送点
      push2:                '',
    }
  };

  /**
   * 消息队列承载的内容
   * @type {{}}
   */
  public msgQueue = {
    // 跳转确认的标识符
    ack: undefined,
  };

  constructor(
    private injector:       Injector,
    public  mqtt:           MyMqttService,
    private cs:             CommonService,
    private msg:            NzMessageService,
    private ntf:            NzNotificationService,
    private modal:          NzModalService,
    public  http:           HttpService,
  ) {
    // 初始化mqtt
    // this.initMqtt();
    // this.cleanOnMsgCallbacks();
  }

  // region MQTT相关

  /**
   * 初始化mqtt
   * @param {string} userId   当前用户id, 用于初始化mqtt使用
   */
  public initMqtt(userId: string) {
    const options: any = environment.MQTT_OPTIONS;
    options.clientId = environment.MQTT_OPTIONS.groupId + '@@@' + userId;
    // 创建mqtt连接
    this.mqtt.init(options);
    // 绑定事件
    this.mqtt.current().onMessage.subscribe((e) => {
      // 获取消息内容
      const message = e.payload.toString();
      // 输出log
      this.cs.log('Task MQTT: received msg:', e.payload.toString());
      // 解析数据
      try {
        const content = JSON.parse(message);
        if (content === null) throw new Error('解析消息体失败! msg: ' + message);
        // 解析数据, 如果数据有误或无法解析则提醒管理员
        if (content['status'] === environment.MQTT_RES_CODES.ok) {
          // 循环触发事件
          for (const k in this.onMsgCallbacks) {
            // 使用通配符来获取对应的模块并对比再触发
            if (k.startsWith('/') ? new RegExp(k).test(content.module) : (k === content.module)) {
              for (const i in this.onMsgCallbacks[k]) {
                if (this.onMsgCallbacks[k][i] instanceof Function)
                  try {
                    this.onMsgCallbacks[k][i].call(this, content, e.topic.toString(), e);
                  } catch (e) {
                    this.cs.error('触发' + k + '模块下' + this.onMsgCallbacks[k][i] + '失败!');
                  }
              }
            }
          }
        } else {
          this.msg.warning('客户终端出错! err: ' + content['msg']);
        }
      } catch (e) {
        this.cs.error('Task MQTT: error in OnMsg: ', e);
      }
    });

    this.cleanOnMsgCallbacks();
  }

  /**
   * 向当前任务的客户终端发送消息
   * @param msg
   */
  public push(msg: any) {
    if (this.current === undefined ||
      this.current.clientId === undefined || this.current.clientId === null) {
      this.msg.warning('您当前没有正在进行中的任务, 无法向客户终端推送消息!');
    }
    // TEST 测试输出用
    this.cs.log('模拟发送:', typeof msg === 'object' ? JSON.stringify(msg) : msg);
    // FIXME 脱离Android终端相应开发, 测试联调需解注释下方代码
    // this.mqtt.publish(this.current.clientId, typeof msg === 'object' ? JSON.stringify(msg) : msg);
  }

  /**
   * 重置mqtt事件监听
   */
  public cleanOnMsgCallbacks() {
    this.onMsgCallbacks = {
      // 来自服务器的消息
      S01: [
        (msg) => {
          switch (msg['action']) {
            case 'refresh':
              // 如果是新任务则提醒
              if (msg['type'] === 'taskAllot') {
                this.msg.info('您有新的任务了!');
                this.ntf.create(
                  'info',
                  '新的任务',
                  '您有新的任务, 情尽快处理!',
                  {
                    nzDuration: 10000
                  }
                );

                // 播放声音
                try {
                  const alertSound: any = document.getElementById('incomingTaskAlertAudio');
                  alertSound.load();
                  alertSound.play();
                } catch (e) { }

                // TODO 更改用户状态至任务进行中
                // this.settings.user.state = '2';
              } else if (msg['type'] === 'taskStop') {
                // TODO 更改用户状态至任务空闲
                // this.settings.user.state = '1';
              }

              // TODO 跳转至任务列表页面 NOTE 使用的非常规刷新页面方法, 如果 跳转的组件 发生了方法或其他什么的更改, 下方代码也需要更改
              /*return this.cs.goto('/main/machine-task', 'MachineTaskComponent', (mtc) => {
                mtc.load();
              });*/
              return ;
            default: break;
          }
        }
      ],
      // 来自公共模块的消息
      W00: [
        (res) => {
          // 释放按钮
          this.flags.utils.cameraInUsingLoading = false;
          // 检查动作是否为回调响应
          if (res['action'] === 'msgCallback' &&
            // 检查内容
            res['data'] !== undefined && res['data'] !== null) {
            // 根据不同command执行不同操作
            switch (res['data']['command']) {
              // 直播反馈
              case 'startLivingStream': {
                // 释放按钮
                this.flags.utils.liveStreamBtnLoading = false;
                // 打开modal
                this.modal.open({
                  title: '直播',
                  footer: false,
                  content: this.data.ls.modal,
                  wrapClassName: 'modal-lg',
                  onCancel: () => {
                    this.push({
                      module: MQTT_MODULES.web.common,
                      action: MQTT_COMMANDS.instru,
                      data: {
                        command: 'stopLivingStream'
                      }
                    });
                  },
                  style: {
                    top: '20px'
                  }
                });
                break;
              }
              // 图片反馈
              case 'capturePhoto': {
                // 检查参数
                if (res['data']['url'] === undefined || res['data']['url'] === null ||
                  res['data']['url'] === '') {
                  this.msg.warning('抓拍图片失败! err: ' + res['msg']);
                } else {
                  this.cs.getOSSObjectAccessURL(res['data']['url'], (url) => {
                    this.utils.photoList.push(url);
                  });
                }
                break;
              }
              // 视频反馈
              case 'captureVideo': {
                // 检查参数
                if (res['data']['url'] === undefined || res['data']['url'] === null ||
                  res['data']['url'] === '') {
                  this.msg.warning('抓拍视频失败! err: ' + res['msg']);
                } else {
                  this.cs.getOSSObjectAccessURL(res['data']['url'], (url) => {
                    this.utils.videoList.push(url);
                  });
                }
                break;
              }
              // android端主动拒绝
              case 'missionFail': {
                this.msg.warning('客户端已终止任务!');
                // TODO 拒绝任务
                // this.doRefuse({refuseReason: 'Android端主动拒绝任务!'});
                break;
              }
              default: this.msg.warning('客户端发送未知指令! command: ' + res['data']['command'] + ', info: ' + res['msg']);
            }
          } else {
            this.msg.warning('解析客户终端数据失败! err: ' + res['msg']);
          }
        }
      ],
    };
  }

  /**
   * 构建android端client
   * @param deviceNo          设备号
   * @returns {string}        clientid
   */
  public buildAndroidClientId = (deviceNo) => {
    return environment.MQTT_OPTIONS.topic + '/p2p/' + environment.MQTT_OPTIONS.groupId + '@@@' + deviceNo + '_app_rec';
  }

  /**
   * 推送跳转命令
   * @param {string} module
   */
  public pushStepCommand(module: string) {
    // 设置ack
    this.msgQueue.ack = this.mqtt.createACK();
    // 发送命令
    this.push(
      {
        module: module,
        action: MQTT_COMMANDS.step,
        data: {
          ack: this.msgQueue.ack,
        }
      }
    );
  }

  /**
   * 检查收到的跳转确认是否有效
   * @param res 收到的消息
   */
  public checkStepCallback(res): Boolean {
    if (res['action'] === 'msgCallback' &&
      // 检查内容
      res['data'] !== undefined && res['data'] !== null &&
      // 匹配ack
      res['data']['ack'] === this.msgQueue.ack) {
      return true;
    } else {
      this.msg.warning('解析客户终端数据失败! err: ' + res['msg']);
    }
    return false;
  }

  // endregion

  // region 开始任务的初始化内容

  /**
   * 开始任务
   * @param task  {taskId: string, deviceNo: string, clientId: string, step?: string}
   */
  public startTask(task: any) {
    // 检查所有数据
    if (
      typeof task.taskId !== 'string' ||
        typeof task.deviceNo !== 'string' ||
          typeof task.clientId !== 'string'
    ) {
      this.msg.error('开始的任务数据有误, 请联系管理员处理!');
    }
    // 赋值到当前任务
    this.current = task;
  }

  /**
   * 清除当前处理中的任务, 并还原所有数据
   */
  public cleanTask() {
    // 清空任务
    this.current = undefined;
    // 清空侧边栏数据
    this.utils.photoList = [];
    this.utils.videoList = [];
    // 还原mqtt事件列表
    this.cleanOnMsgCallbacks();
    // 重置mqtt内容
    this.msgQueue.ack = this.mqtt.createACK();
    // 还原所有标识符
    this.flags.mask.loading                         = false;
    this.flags.mqtt.responseTimeout                 = false;
    this.flags.mqtt.waitResFromAndroidLoading       = false;
    this.flags.utils.cameraInUsingLoading           = false;
    this.flags.utils.liveStreamBtnLoading           = false;
    // 重置步骤至0
    this.step = STEP_FLAGS[0];
  }

  // endregion 开始任务的初始化内容

  // region 异步获取公共依赖服务

  /**
   * 获取消息提示实例
   * @returns {NzMessageService}
   */
  /*get msg(): NzMessageService {
    return this.injector.get(NzMessageService);
  }*/

  // endregion 异步获取公共依赖服务

  // region 展示图片, 视频悬浮窗

  /**
   * 播放视频
   * @param e
   */
  public showVideo(e) {
    this.data.videoViewer.url = e.target.src;
    this.modal.open({
      title: '播放视频',
      footer: false,
      content: this.data.videoViewer.modal,
      wrapClassName: 'modal-lg',
      onCancel: () => {
        this.data.videoViewer.url = '';
      },
      style: {
        top: '20px'
      }
    });
  }

  /**
   * 显示一张图片
   * @param e
   */
  public showPhoto(e) {
    this.data.photoViewer.url = e.target.src;
    this.modal.open({
      title: '查看图片',
      footer: false,
      content: this.data.photoViewer.modal,
      wrapClassName: 'modal-lg',
      onCancel: () => {
        this.data.photoViewer.url = '';
      },
      style: {
        top: '20px'
      }
    });
  }

  // endregion

  // region 侧边栏

  /**
   * 抓拍图片
   */
  public capturePhoto() {
    // 发送指令
    this.push({
      module: MQTT_MODULES.web.common,
      action: MQTT_COMMANDS.instru,
      data: {
        command: 'capturePhoto',
      }
    });
    // 禁用btn
    this.flags.utils.photoBtnLoading = true;
    this.flags.utils.cameraInUsingLoading = true;

    // 若干时间后释放
    setTimeout(() => {
      this.flags.utils.photoBtnLoading = false;
    }, 10000);
  }

  /**
   * 抓拍视频
   */
  public captureVideo() {
    // 发送指令
    this.push({
      module: MQTT_MODULES.web.common,
      action: MQTT_COMMANDS.instru,
      data: {
        command: 'captureVideo',
      }
    });
    // 禁用btn
    this.flags.utils.videoBtnLoading = true;
    this.flags.utils.cameraInUsingLoading = true;

    // 若干时间后释放
    setTimeout(() => {
      this.flags.utils.videoBtnLoading = false;
    }, 60000);
  }

  /**
   * 请求直播
   */
  public askForLiveStreamURL() {
    // 发送指令
    this.push({
      module: MQTT_MODULES.web.common,
      action: MQTT_COMMANDS.instru,
      data: {
        command: 'startLivingStream',
        push2: this.data.ls.push2
      }
    });

    // 禁用btn
    this.flags.utils.liveStreamBtnLoading = true;
    this.flags.utils.cameraInUsingLoading = true;
  }

  /**
   * 加载问题列表
   * @param {string} type
   */
  public loadInquiryList(type: string) {
    this.http.get(
      this.cs.getUrl(
        environment.REQ_URLS.question.question,
        {type: type}
      )
    ).subscribe(
      (res: any) => {
        if (res.code === environment.SERVICE_RES_CODES.ok) {
          this.utils.questionList = res.data;
        } else {
          this.msg.warning('获取问题列表失败! err: ' + res.msg);
        }
      }
    );
  }

  /**
   * 清空倒计时
   */
  public cleanCountdown() {
    this.utils.countDown = 0;
    this.flags.utils.showCountingDown = false;
  }

  // endregion

}

import {Injectable, Injector} from '@angular/core';
import {MyMqttService} from './myMqtt.service';
import {environment} from '@env/environment';
import {CommonService} from './common.service';
import {NzMessageService, NzModalService, NzNotificationService} from 'ng-zorro-antd';
import {MqttServiceOptions} from 'ngx-mqtt/src/mqtt.model';

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
  instru: 'instru',
};

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
  public current = {
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
    // 流程是否全部走完; 用于标记是否直接跳转至最后一页
    fullyProcessed:         false,
    // 当前处理任务的状态
    step:                   STEP_FLAGS[0],
  };

  /**
   * 当前任务标记的东西
   * @type {{}}
   */
  public flags = {
    // 侧边工具栏
    utils: {
      // 终端摄像头正在使用中
      cameraInUsingLoading:     false,
      liveStreamBtnLoading:     false,

    }
  };

  /**
   * 侧边栏工具承载的对象
   * @type {{}}
   */
  public utils = {
    livingStreamModal:  undefined,
    photoList:          [],
    videoList:          []
  };

  constructor(
    private injector:       Injector,
    private mqtt:           MyMqttService,
    private cs:             CommonService,
    private msg:            NzMessageService,
    private ntf:            NzNotificationService,
    private modal:          NzModalService,
  ) {
    // 初始化mqtt
    this.initMqtt();
    this.cleanOnMsgCallbacks();
  }

  // region MQTT相关

  /**
   * 初始化mqtt
   */
  public initMqtt(options?: MqttServiceOptions) {
    // 创建mqtt连接
    this.mqtt.init(options !== undefined ? options : environment.MQTT_OPTIONS);
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
            // 获取对应的模块并对比再触发
            if (k === message.module) {
              for (const i in this.onMsgCallbacks[k]) {
                if (this.onMsgCallbacks[k][i] instanceof Function)
                  this.onMsgCallbacks[k][i].call(this, message, e.topic.toString(), e);
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
    this.mqtt.current().publish(this.current.clientId, typeof msg === 'object' ? JSON.stringify(msg) : msg)
      .subscribe((err) => console.log(err));
  }

  /**
   * 重置mqtt事件监听
   */
  public cleanOnMsgCallbacks() {
    this.onMsgCallbacks = {
      // 来自服务器的消息
      S01: [
        (msg, topic, e) => {
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

              // 跳转至任务列表页面 NOTE 使用的非常规刷新页面方法, 如果 跳转的组件 发生了方法或其他什么的更改, 下方代码也需要更改
              return this.cs.goto('/main/machine-task', 'MachineTaskComponent', (mtc) => {
                mtc.load();
              });
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
                  content: this.utils.livingStreamModal,
                  wrapClassName: 'modal-lg',
                  onCancel: () => {
                    this.push({
                      module: 'W00',
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
      ]
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
    this.current = undefined;
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

}

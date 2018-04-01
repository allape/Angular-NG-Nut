import {Injectable, Injector} from '@angular/core';
import {MqttService} from 'ngx-mqtt';
import {MqttConnectionState, MqttServiceOptions} from 'ngx-mqtt/src/mqtt.model';
import {CommonService} from './common.service';
import {Md5} from 'ts-md5';

/**
 * 连接的协议
 */
export enum protocols {
  ws = 'ws',
  wss = 'wss'
}

export type QoS = 0 | 1 | 2;

@Injectable()
export class MyMqttService {

  /**
   * mqtt实例
   */
  private mqtt: MqttService;

  /**
   * 当前连接的参数; 未初始化时为null
   */
  private options: MqttServiceOptions;

  /**
   * 创建唯一标识符
   * @returns {string | Int32Array}   32位字符串
   */
  public createACK() {
    return Md5.hashStr(Date.now() + '_' + Math.random());
  }

  /**
   * 构造函数
   */
  constructor(
    private injector:       Injector,
    private cs:             CommonService
  ) { }

  /**
   * 初始化mqtt连接
   * @param {MqttServiceOptions} options      连接参数
   * @returns {MqttService}                   连接成功后的单例mqtt对象
   */
  public init(options: MqttServiceOptions): MqttService {
    // 设置参数, 以便回调查询
    this.options = options;
    // 检查当前是否已经有连接了, 有就先断开先前的连接
    if (this.mqtt !== undefined && this.mqtt !== null && this.mqtt.state.getValue() === MqttConnectionState.CONNECTED) {
      try {
        this.mqtt.disconnect();
      } catch (e) {
        this.cs.error('Global MQTT: closed failed! err: ', e.message);
      }
    }
    // 创建新的连接
    this.mqtt = new MqttService(options);
    this.cs.log('Global MQTT: inited with ClientId: ' + options.clientId);
    return this.mqtt;
  }

  /**
   * 发送消息
   * @param {string} topic        主题
   * @param {string} message      消息内容
   * @param {boolean} retain      是否记录
   * @param {QoS} qos             消息质量
   */
  public publish(topic: string, message: string, retain = false, qos: QoS = 0): void {
    this.cs.log('Global MQTT: published', message, 'to', topic, 'with quality', qos);
    this.mqtt.publish(topic, message, {retain, qos}).subscribe((err) => this.cs.error(err));
  }

  /**
   * 获取当前连接对象
   * @returns {MqttService}                   连接对象
   */
  public current(): MqttService {
    if (this.mqtt === null) {
      this.cs.error('Global MQTT: has not be inited!');
      return null;
    }
    return this.mqtt;
  }

}

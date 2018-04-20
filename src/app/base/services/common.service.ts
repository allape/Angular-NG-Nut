import {Injectable, Injector} from '@angular/core';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';

@Injectable()
export class CommonService {

  /**
   * 全局loading遮罩
   * @type {boolean}
   */
  public mask = false;

  /**
   * 数据寄存处
   * @type {{}}
   */
  private data = {};

  /**
   * 注册了的组件, 用于对组件的特定操作
   * @type {any[]}
   */
  private registeredComponents = {};

  /**
   * 注册了的服务, 用于在上级或者更上几级的服务中调用子服务
   * @type {{}}
   */
  private registeredServices = {};

  constructor(
    private injector: Injector,
  ) {
    // 初始化日志输出级别
    CommonService.initLogger(environment.logger.level);

    // TEST 输出当前实例, 用于在调试台调用
    console.log(this);
  }

  // region 日志

  public static initLogger(level?: string) {
    // 等级列表
    const LEVELS = [
      'none',
      'error',
      'warning',
      'info',
      'debug',
      'log',
      'trace',
    ];

    // 整理参数
    level = level ? level.toLocaleLowerCase() : '';
    const levelStage = LEVELS.includes(level) ? LEVELS.indexOf(level) : LEVELS.length;

    // 设置不输出的等级对应的console方法为空方法
    for (let i = LEVELS.length; i > levelStage; i--) {
      console[LEVELS[i]] = () => {};
    }
  }

  // endregion

  // region 注册组件操作

  /**
   * 注册组件
   * @param {string} name               组件名称
   * @param {any} component             组件实例
   * @param {boolean} forcelyOverride   如果当前组件名称已被注册, 是否强行覆盖
   */
  public registerComponent(name: string, component: any, forcelyOverride: boolean = true) {
    if (this.registeredComponents[name] !== undefined && !forcelyOverride) {
      throw new Error('组件' + name + '已被注册!');
    } else {
      this.registeredComponents[name] = component;
    }
  }

  /**
   * 移除注册了的组件
   * @param {string} name     移除组件的名称; 未提供时清除所有注册了的组件
   * @returns {boolean}
   */
  public unregisterComponent(name?: string) {
    if (name === undefined) {
      this.registeredComponents = {};
    } else {
      delete this.registeredComponents[name];
    }
    return true;
  }

  /**
   * 获取注册了的组件
   * @param {string} name       名称
   * @param defaultComponent    未找到指定的组件时返回的数据
   */
  public getRegisteredComponent(name: string, defaultComponent: any = null) {
    return this.registeredComponents[name] ? this.registeredComponents[name] : defaultComponent;
  }

  // endregion

  // region 注册服务操作

  /**
   * 注册服务
   * @param {string} name             注册的名称
   * @param service                   注册的服务
   * @param {boolean} forcelyOverride 是否强制覆盖
   */
  public registerService(name: string, service: any, forcelyOverride: boolean = true) {
    if (this.registeredServices[name] !== undefined && !forcelyOverride) {
      throw new Error('服务' + name + '已被注册!');
    } else {
      this.registeredServices[name] = service;
    }
  }

  /**
   * 移除服务的注册
   * @param {string} name         解除注册的名称; 未提供时清除所有注册服务
   * @returns {boolean}
   */
  public unregisterService(name?: string) {
    if (name === undefined) {
      this.registeredServices = {};
    } else {
      delete this.registeredServices[name];
    }
    return true;
  }

  /**
   * 获取注册了的服务
   * @param {string} name     名称
   * @param defaultService 未找到指定的服务时, 返回该参数
   * @returns {any}
   */
  public getRegisteredService(name: string, defaultService: any = null) {
    return this.registeredServices[name] ? this.registeredServices[name] : defaultService;
  }

  // endregion

  // region 路由

  /**
   * 路由跳转
   * @param {string} url      跳转的链接
   * @param {Function} here   当跳转的链接就是当前的时候的回调
   */
  public goto(url: string, here?: Function) {
    here = here !== undefined ? here : () => {};
    setTimeout(() => {
      const router = this.injector.get(Router);
      if (router.url === url) {
        try {
          here.call(this);
        } catch (e) {
          console.error('路由跳转至相同界面出错!', e);
        }
      } else {
        return router.navigateByUrl(url);
      }
    });
  }

  // endregion

  // region 数据寄存

  /**
   * 设置数据寄存
   * @param {string} name   寄存名称
   * @param value           寄存数据
   * @param forcelyOverride 是否强制覆盖已有数据; false且数据已存在则抛出错误
   */
  public setData(name: string, value: any, forcelyOverride: boolean = true) {
    if (this.data[name] !== undefined && !forcelyOverride) {
      throw new Error('寄存名称已存在!');
    }
    this.data[name] = value;
  }

  /**
   * 获取寄存数据
   * @param {string} name   寄存名称
   * @param check           是否检查存不存在; 为true且寄存数据不存在则抛出错误
   * @returns {any}         寄存数据
   */
  public getData(name: string, check: boolean = false): any {
    if (check && this.data[name] === undefined) {
      throw new Error('获取寄存的数据不存在!');
    }
    return this.data[name];
  }

  // endregion

}

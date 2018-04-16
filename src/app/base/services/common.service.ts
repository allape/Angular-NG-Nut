import {Injectable, Injector} from '@angular/core';
import {environment} from '../../../environments/environment';

@Injectable()
export class CommonService {

  /**
   * 在common service中注册了的组件, 用于对组件的特定操作
   * @type {any[]}
   */
  private registeredComponents = {};

  constructor(
    private injector: Injector,
  ) {
    CommonService.initLogger(environment.logger.level);
  }

  // region 日志

  public static initLogger(level?: string) {
    // 等级列表
    const LEVELS = [
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

    // 设置不输出的登录对应的console方法为空方法
    for (let i = LEVELS.length; i > levelStage; i--) {
      console[LEVELS[i]] = () => {};
    }
  }

  // endregion

  // region 组件操作

  /**
   * 注册组件
   * @param {string} name               组件名称
   * @param {any} component             组件实例
   * @param {boolean} forcelyOverride   如果当前组件名称已被注册, 是否强行覆盖
   */
  public registerComponent(name: string, component: any, forcelyOverride: boolean = true) {
    if (this.registeredComponents[name] !== undefined && !forcelyOverride) {
      throw new Error(name + '已被注册!');
    } else {
      this.registeredComponents[name] = component;
    }
  }

  /**
   * 移除注册了的组件
   * @param {string} name     移除组件的名称
   * @returns {boolean}
   */
  public unregisterComponent(name: string) {
    delete this.registeredComponents[name];
    return true;
  }

  /**
   * 获取注册了的组件
   * @param {string} name
   */
  public getRegisteredComponent(name: string) {
    return this.registeredComponents[name];
  }

  // endregion

}

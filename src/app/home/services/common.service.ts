import {ApplicationRef, Component, Injectable, Injector} from '@angular/core';
import {environment} from '@env/environment';
import {Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {AppComponent} from '../../app.component';
import {HttpClient} from '@angular/common/http';
import {NzMessageService, NzNotificationService} from 'ng-zorro-antd';

/**
 * 公共使用的正则表达式
 */
export const REG_EXP = {
  phone: /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/
};

/**
 * 日志类型
 */
export const enum LOGGER {
  log   = 'log',
  info  = 'info',
  warn  = 'warn',
  trace = 'trace',
  debug = 'debug',
  error = 'error'
}

@Injectable()
export class CommonService {

  constructor(
    private injector:       Injector,
    private router:         Router,
    private sanitizer:      DomSanitizer,
    private appRef:         ApplicationRef,
    private http:           HttpClient,
    private msg:            NzMessageService,
    private ntf:            NzNotificationService
  ) { }

  // region 网络请求相关

  /**
   * 获取完整的请求url
   * @param {string} url      拼接的url
   * @param {any} suffix      纯字符串的后缀或者一个map
   * @returns {string}        拼接好了的url
   */
  public getUrl(url: string, suffix?: any) {
    let realSuffix = suffix;
    if (typeof suffix === 'object') {
      if (suffix instanceof Array) {
        realSuffix = undefined;
      } else {
        realSuffix = '?';
        for (const key in suffix) {
          realSuffix += key + '=' + encodeURI(suffix[key]) + '&';
        }
        realSuffix = realSuffix.substring(0, realSuffix.length - 1);
      }
    }
    return environment.HOST + url + (realSuffix === undefined ? '' : realSuffix);
  }

  // endregion

  // region 日志相关

  /**
   * 根据当前环境配置输出日志内容
   * @param info
   */
  public dolog(type: LOGGER, ...info): void {
    // 非生产环境才输出内容
    if (!environment.production) console[type](...info);
  }

  /**
   * 输出log级日志
   * @param info
   */
  public log(...info): void {
    this.dolog(LOGGER.log, ...info);
  }

  /**
   * 输出error级日志
   * @param info
   */
  public error(...info): void {
    this.dolog(LOGGER.error, ...info);
  }

  // endregion

  // region 路由相关

  /**
   * 跳转至
   * @param {string} url                                  跳转的链接
   * @param {Function} clazz                              如果跳转的链接就是当前页面, 则搜索对应的组件, 并返回
   * @param {Function} callback                           找到组件后的回调
   */
  public goto(url: string, clazz: Function | string, callback: Function) {
    setTimeout(() => {
      const router = this.injector.get(Router);
      if (router.url === url) {
        const target = this.getAngularComponent(clazz);
        if (target !== null) {
          try {
            callback.call(this, target);
          } catch (e) { }
        }
      } else
        return router.navigateByUrl(url);
    });
  }

  // endregion

  // region 搜寻组件相关

  /**
   * 根据类名获取angular的组件
   * @param {any} clazz     搜寻的类; 可以为字符串或类的构造函数; 构造函数搜索更加准确
   */
  public getAngularComponent(clazz: any): any {
    // 返回的对象
    let target: Component = null;
    // 查询方法是根据类的构造函数来还是名称
    const isString = typeof clazz === 'string';

    // 获取顶层组件, 即AppComponent
    if (this.appRef.components !== undefined && this.appRef.components !== null && this.appRef.components.length > 0) {
      // 初始化
      let appComRef = null;
      // 循环获取AppComponent, 避免其他顶层组件干扰
      for (const i in this.appRef.components) {
        if (this.appRef.components[i].instance !== undefined && this.appRef.components[i].instance !== null)
          if (this.appRef.components[i].instance instanceof AppComponent) {
            appComRef = this.appRef.components[i];
          }
      }

      // 检查是否有APPComponent, 没有就抛出错误; 因为当前代码可能不适用于当前框架环境
      if (appComRef === null) throw new Error('未获取到顶级组件 APPComponent , 请验证当前框架环境!');

      // 如果获取的就是APPComponent则直接返回
      if (isString ? (clazz === 'AppComponent') : (clazz === AppComponent)) return appComRef.instance;

      // 检查APPComponent, 避免空值错误
      if (
        appComRef._view !== undefined && appComRef._view !== null
        && appComRef._view.nodes instanceof Array
      ) {
        // 开始递归查询
        target = this.findComponent(clazz, appComRef._view.nodes, [], isString);
      }
    }

    return target;
  }

  /**
   * 获取组件的递归实现 NOTE 仅限搜索单例组件
   * @param clazz                 寻找的组件的类
   * @param array                 遍历的列表
   * @param scannedClasses          已经深入遍历过的组件名称集合; 避免依赖循环;
   * @param {Boolean} isString    搜寻的组件是名称还是类的构造函数
   * @returns {any}
   */
  private findComponent(clazz: any, array: Array<any>, scannedClasses: Array<any>, isString: Boolean): any {
    // 检查数据
    if (
      clazz === undefined || clazz === null ||
      !(array instanceof Array) || !(scannedClasses instanceof Array)
    ) {
      this.error('寻找组件失败, 参数错误: clazz:', (isString ? clazz : this.getClassName(clazz)),
        ', array:', array, ', scannedClasses:', scannedClasses);
      return null;
    }

    // 获取到的组件, 初始化为null
    let found: Component = null;

    // 循环遍历
    for (const i in array) {
      // 检查数据, 避免空值报错
      if (array[i] === undefined || array[i] === null) {
        continue;
      } else {
        // 如果节点下的instance不为空则表示这个是一个组件实例; 其中包含了该组件依赖的所有service和自己的公共方法
        if (array[i].instance !== undefined && array[i].instance !== null) {
          // 如果是搜索的实例, 则返回
          if (isString ? clazz === this.getClassName(array[i].instance) : (array[i].instance instanceof clazz)) {
            return array[i].instance;
          }
        } else if (
          // 如果以下项存在, 则表示这个是组件的渲染和显示信息, 其中就包含了其子组件或子界面信息
        (array[i].componentView !== undefined && array[i].componentView !== null)
        || (array[i].viewContainer !== undefined && array[i].viewContainer !== null)
        ) {

          // 如果componentView存在, 则这个节点是个组件
          // componentView只可能为一个对象或undefined, 为了避免其他情况则仍判断不为null
          if (array[i].componentView !== undefined && array[i].componentView !== null) {
            // 判断当前componentView是否为查找的组件
            if (isString ? clazz === this.getClassName(array[i].componentView.component) :
                (array[i].componentView.component instanceof clazz)) {
              return array[i].componentView.component;
            }

            // 获取当前组件的名称, 判断是否已经扫描了, 避免循环依赖
            let existsFlag = false;
            const componentClassName = this.getClassName(array[i].componentView.component);
            for (const sci in scannedClasses) {
              if (isString ? componentClassName === scannedClasses[sci] :
                  (array[i].componentView.component instanceof scannedClasses[sci])) {
                existsFlag = true;
                break;
              }
            }
            if (existsFlag) continue;
            // 添加到已扫描队列
            scannedClasses.push(isString ? componentClassName : array[i].componentView.component.constructor);
            // 递归查询
            found = this.findComponent(clazz, array[i].componentView.nodes, scannedClasses, isString);
            if (found !== null) return found;
          } else {
            // 其他状况必然为 (array[i].viewContainer !== undefined && array[i].viewContainer !== null)
            // viewContainer只可能为一个对象或null, 为了避免其他情况则仍判断不为undefined

            // _embeddedViews是内嵌页面对象的集合, _view是当前页面对象的数据
            if (array[i].viewContainer._embeddedViews instanceof Array) {
              // 循环查询子页面获取到下一个页面/组件集合
              // vcevi = viewContainer._embeddedViews的i
              for (const vcevi in array[i].viewContainer._embeddedViews) {
                if (
                  array[i].viewContainer._embeddedViews[vcevi] !== undefined && array[i].viewContainer._embeddedViews[vcevi] !== null
                  && array[i].viewContainer._embeddedViews[vcevi].nodes instanceof Array
                ) {
                  // 递归查询
                  found = this.findComponent(clazz, array[i].viewContainer._embeddedViews[vcevi].nodes, scannedClasses, isString);
                  if (found !== null) return found;
                }
              }
            }
          }
        } else {
          // 其余未研究的内容
        }
      }
    }
    return found;
  }

  /**
   * 获取对象的类名, 在js中即为constructor的名称
   * @param obj 操作的对象
   */
  private getClassName(obj) {
    return obj === undefined || obj === null ? null : obj.constructor.toString().substring(9, obj.constructor.toString().indexOf('('));
  }

  // endregion

  // region 其他工具

  /**
   * 格式化时间为yyyy-MM-dd
   * @param {Date} date
   * @returns {string}
   */
  public formatDate(date?: Date) {
    date = date === undefined ? new Date() : date;
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  }

  /**
   * 获取oss文件访问路径
   * @param {string} objId
   * @param {Function} callback
   */
  public getOSSObjectAccessURL(objId: string, callback?: Function) {
    this.http.post(this.getUrl(environment.REQ_URLS.common.getFilePath, {FilePath: objId}), null).subscribe(
      (hres: any) => {
        if (hres.code === environment.SERVICE_RES_CODES.ok) {
          try {
            if (callback !== undefined && callback !== null) {
              callback.call(this, hres.data.url);
            }
          } catch (e) {
            this.msg.error('解析文件访问地址失败! err: ' + e.message);
          }
        } else {
          this.msg.warning('获取文件访问地址失败! err: ' + hres.msg);
        }
      }
    );
  }

  /**
   * 过滤url, 防止安全机制拦截
   * @param {string} url
   */
  public formatUnsafeURL(url: string): any {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // endregion

}

import {enableProdMode, Injectable, Injector} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {NzMessageService} from 'ng-zorro-antd';
import {Utils} from '../../utils/utils';
import {HttpMsgHandlerGlobal} from './http.msghandler.global';
import {IHttpMsgHandlerGlobal} from './Ihttp.msghandler.global';

// 开启生产模式, 防止提示loading在检查后改变
enableProdMode();

@Injectable()
export class HttpService {

  /**
   * 自定义响应内容提示配置
   */
  public msgHandler: IHttpMsgHandlerGlobal = new HttpMsgHandlerGlobal();

  /**
   * 请求的服务器host
   * @type {string}
   */
  public host = 'http://localhost:8080';

  /**
   * 公共请求头数据
   * @type {{}}
   */
  public headers = {};

  /**
   * 当前是否正在加载数据
   * @type {boolean}
   */
  public loading = false;

  /**
   * 构造器
   * @param {Injector} injector
   * @param {HttpClient} http
   * @param {NzMessageService} msg
   */
  constructor(
    private injector:   Injector,
    private http:       HttpClient,
    private msg:        NzMessageService,
  ) { }

  /**
   * 创建一个带参数的url
   * @param {string} url  源url
   * @param suffix        参数列表
   * @returns {string}
   */
  public static buildUrl(url: string, suffix?: any): string {
    let realSuffix = suffix;
    if (typeof suffix === 'object') {
      if (suffix instanceof Array) {
        realSuffix = undefined;
      } else {
        realSuffix = '?';
        for (const key in suffix) {
          if (suffix.hasOwnProperty(key)) {
            realSuffix += key + '=' + encodeURI(suffix[key]) + '&';
          }
        }
        realSuffix = realSuffix.substring(0, realSuffix.length - 1);
      }
    }
    return url + (realSuffix === undefined ? '' : realSuffix);
  }

  /**
   * 将指定url拼接上host
   * @param {string} url      操作的url
   * @returns {string}        返回拼接了的url
   */
  private concatWithHost(url: string): string {
    return this.host + url;
  }

  /**
   * 发送http请求
   * @param {string} method     请求方法
   * @param {string} url        请求的链接
   * @param options             请求选项
   * @param msgHandler          消息处理配置
   * @returns {Observable<Object>}
   */
  public request(
    method: string,
    url: string,
    options?: {
      body?: any;
      headers?: HttpHeaders | {
        [header: string]: string | string[];
      };
      observe?: 'body';
      params?: HttpParams | {
        [param: string]: string | string[];
      };
      responseType?: 'json';
      reportProgress?: boolean;
      withCredentials?: boolean;
    },
    msgHandler?: IHttpMsgHandlerGlobal
  ): Observable<Object> {
    // 开始loading
    this.loading = true;
    // 返回订阅
    return new Observable<Object>((observer) => {
      this.http.request(method, this.concatWithHost(url), options).subscribe(
        (res: any) => {
          // 取消loading
          this.loading = false;

          // 输出logo
          console.log(url, '请求完成. res: ', res);

          // 检查消息处理配置
          try {
            // 格式化数据
            msgHandler = this.msgHandler.format(msgHandler ? msgHandler : {});
            // 格式化消息内容
            res = typeof res === 'string' ? JSON.parse(res) : res;
            // 提示消息
            if (
              // 检查消息体内容
              Utils.referencable(res) &&
              // 检查是否提示
              msgHandler.showNotOkMsg !== false &&
              // 检查状态码是否ok
              res[msgHandler.codeName] !== msgHandler.okCode &&
              // 检查对应的消息级别是否存在
              Utils.referencable(this.msg[msgHandler.msgLevel])
            ) {
              // 调用不同级别的
              this.msg[this.msgHandler.msgLevel](
                msgHandler.notOkMsg +
                (msgHandler.showWithMsg ? msgHandler.msgSeparator + res[msgHandler.msgName] : '')
              );
            }

            // 检查是否有且仅响应ok码
            if (
              res[msgHandler.codeName] !== msgHandler.okCode &&
              msgHandler.okResponse !== false
            ) {
              // 如果仅仅响应ok状态, 则提示错误订阅
              return observer.error(res);
            }
          } catch (e) {
            console.error('处理提示消息失败! err:', e);
          }

          // 通知订阅者请求完成
          return observer.next(res);
        },
        // 请求出错
        error => {
          // 关闭loading
          this.loading = false;
          // 输出消息
          console.error(url, '请求失败! err:', error);
          // 通知订阅者请求出错
          return observer.error(error);
        },
        // 订阅完成; 几乎没用
        () => {
          // 关闭loading
          this.loading = false;
          // 通知订阅者
          return observer.complete();
        }
      );
    });
  }

  /**
   * 发送post请求
   * @param url        请求的链接
   * @param body       请求体
   * @param msgHandler 消息处理配置
   * @returns {Observable<Object>}
   */
  public post(url: string, body: any | null, msgHandler?: IHttpMsgHandlerGlobal): Observable<Object> {
    return this.request('post', url, {body: body, headers: this.headers}, msgHandler);
  }

  /**
   * 发送get请求
   * @param {string} url              请求的链接
   * @param msgHandler                消息处理配置
   * @returns {Observable<Object>}
   */
  public get(url: string, msgHandler?: IHttpMsgHandlerGlobal): Observable<Object> {
    return this.request('get', url, {headers: this.headers}, msgHandler);
  }

  /**
   * 发送delete请求
   * @param {string} url              请求的链接
   * @param msgHandler                消息处理配置
   * @returns {Observable<Object>}
   */
  public delete(url: string, msgHandler?: IHttpMsgHandlerGlobal): Observable<Object> {
    return this.request('delete', url, {headers: this.headers}, msgHandler);
  }

  /**
   * 发送put请求
   * @param {string} url              请求的链接
   * @param body                      请求的数据
   * @param msgHandler                消息处理配置
   * @returns {Observable<Object>}
   */
  public put(url: string, body: any, msgHandler?: IHttpMsgHandlerGlobal): Observable<Object> {
    return this.request('put', url, {body: body, headers: this.headers}, msgHandler);
  }

}

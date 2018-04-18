import {enableProdMode, Injectable, Injector} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {NzMessageService} from 'ng-zorro-antd';
import {Utils} from '../utils/utils';

// 开启生产模式, 防止提示loading在检查后改变
enableProdMode();

@Injectable()
export class HttpService {

  /**
   * 自定义响应内容提示配置
   */
  public responseMsgConfig = {
    // 响应编号在首级JSON中的名称 --> 例如: {"code": -1, "msg": "处理失败!"}
    codeName:         'code',
    // 响应消息在首级JSON中的名称 --> 如上
    msgName:          'msg',
    // 正常时候的编号, 不是这个的时候会提示消息
    okCode:           1,
    // 非正常的时候提示的消息
    defaultNotOkMsg:  '数据加载失败!',
    // 提示级别
    msgLevel:         'warning',
    // 是否显示响应的消息字段
    showWithMsg:      true,
    // 拼接响应消息的符号
    msgSeparator:     ', ',
  };

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
  private static concatWithHost(url: string): string {
    return environment.http.host + url;
  }

  /**
   * 发送http请求
   * @param {string} method     请求方法
   * @param {string} url        请求的链接
   * @param options             请求选项
   *
   * @param extras              额外的选项;
   * 有效值: {
   *  showNotOkMsg: '状态不ok时是否显示消息; 有且只有false的时候才不显示, 即undefined时也显示',
   *  notOkMsg:     '显示的消息前缀',
   *  okResponse:   '是否仅响应状态为ok的; 有且仅有false时才在任意状态响应'
   * }
   *
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
    extras: any
  ): Observable<Object> {
    this.loading = true;
    return new Observable<Object>((observer) => {
      this.http.request(method, HttpService.concatWithHost(url), options).subscribe(
        (res: any) => {
          this.loading = false;
          console.log(url, '请求完成. res: ', res);

          // 检查响应内容 NOTE 可读性极差, 有问题直接删除即可
          try {
            if (
              // 检查是否配置
              Utils.referencable(extras)
            ) {
              // 格式化消息内容
              res = typeof res === 'string' ? JSON.parse(res) : res;
              // 提示消息
              if (
                // 检查是否提示
                extras['showNotOkMsg'] !== false &&
                // 检查状态码是否ok
                res[this.responseMsgConfig.codeName] !== this.responseMsgConfig.okCode &&
                // 检查对应的消息级别是否存在
                Utils.referencable(this.msg[this.responseMsgConfig.msgLevel])
              ) {
                // 调用不同级别的
                this.msg[this.responseMsgConfig.msgLevel](
                  (Utils.hasText(extras['notOkMsg']) ? extras['notOkMsg'] : this.responseMsgConfig.defaultNotOkMsg) +
                  (this.responseMsgConfig.showWithMsg ? this.responseMsgConfig.msgSeparator + res[this.responseMsgConfig.msgName] : '')
                );
              }

              // 检查是否有且仅响应ok码
              if (
                res[this.responseMsgConfig.codeName] !== this.responseMsgConfig.okCode &&
                extras['okResponse'] !== false
              ) {
                // 如果仅仅响应ok状态, 则提示错误订阅
                return observer.error(res);
              }
            }
          } catch (e) {
            console.error('处理提示消息失败! err:', e);
          }

          return observer.next(res);
        },
        error => {
          this.loading = false;
          console.error(url, '请求失败! err:', error);
          return observer.error(error);
        },
        () => {
          this.loading = false;
          return observer.complete();
        }
      );
    });
  }

  /**
   * 发送post请求
   * @param url       请求的链接
   * @param body      请求体
   * @param extras    额外参数
   * @returns {Observable<Object>}
   */
  public post(url: string, body: any | null, extras?: any): Observable<Object> {
    return this.request('post', url, {body: body, headers: this.headers}, extras);
  }

  /**
   * 发送get请求
   * @param {string} url              请求的链接
   * @param extras                    额外参数
   * @returns {Observable<Object>}
   */
  public get(url: string, extras?: any): Observable<Object> {
    return this.request('get', url, {headers: this.headers}, extras);
  }

  /**
   * 发送delete请求
   * @param {string} url              请求的链接
   * @param extras                    额外参数
   * @returns {Observable<Object>}
   */
  public delete(url: string, extras?: any): Observable<Object> {
    return this.request('delete', url, {headers: this.headers}, extras);
  }

  /**
   * 发送put请求
   * @param {string} url              请求的链接
   * @param body                      请求的数据
   * @param extras                    额外参数
   * @returns {Observable<Object>}
   */
  public put(url: string, body: any, extras?: any): Observable<Object> {
    return this.request('put', url, {body: body, headers: this.headers}, extras);
  }

}

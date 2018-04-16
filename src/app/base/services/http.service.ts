import {Injectable, Injector} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable()
export class HttpService {

  public headers = {};

  public loading = false;

  constructor(
    private injector:   Injector,
    private http:       HttpClient,
  ) { }

  /**
   * 发送post请求
   * @param url       请求的链接
   * @param body      请求体
   * @returns {Observable<Object>}
   */
  public post(url: string, body: any | null): Observable<Object> {
    return this.http.post(this.concatWithHost(url), body, {headers: this.headers});
  }

  /**
   * 发送get请求
   * @param {string} url              请求的链接
   * @returns {Observable<Object>}
   */
  public get(url: string): Observable<Object> {
    return this.http.get(this.concatWithHost(url), {headers: this.headers});
  }

  /**
   * 创建一个带参数的url
   * @param {string} url  源url
   * @param suffix        参数列表
   * @returns {string}
   */
  public buildUrl(url: string, suffix?: any): string {
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
    return environment.http.host + url;
  }

}

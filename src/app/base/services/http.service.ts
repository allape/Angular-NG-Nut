import {Injectable, Injector} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
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
   * 发送http请求
   * @param {string} method     请求方法
   * @param {string} url        请求的链接
   * @param options    请求选项
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
    }
  ): Observable<Object> {
    this.loading = true;
    return new Observable<Object>((observer) => {
      this.http.request(method, this.concatWithHost(url), options).subscribe(
        (res: any) => {
          this.loading = false;
          console.log(url, '请求完成. res: ', res);
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
   * @returns {Observable<Object>}
   */
  public post(url: string, body: any | null): Observable<Object> {
    return this.request('post', url, {body: body, headers: this.headers});
  }

  /**
   * 发送get请求
   * @param {string} url              请求的链接
   * @returns {Observable<Object>}
   */
  public get(url: string): Observable<Object> {
    return this.request('get', url, {headers: this.headers});
  }

  /**
   * 发送delete请求
   * @param {string} url              请求的链接
   * @returns {Observable<Object>}
   */
  public delete(url: string): Observable<Object> {
    return this.request('delete', url, {headers: this.headers});
  }

  /**
   * 发送put请求
   * @param {string} url              请求的链接
   * @param body                      请求的数据
   * @returns {Observable<Object>}
   */
  public put(url: string, body: any): Observable<Object> {
    return this.request('put', url, {body: body, headers: this.headers});
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

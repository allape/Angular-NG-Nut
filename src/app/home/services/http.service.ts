import {Injectable, Injector} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class HttpService {

  public headers = {};

  public loading = false;

  constructor(
    private injector: Injector,
    private http: HttpClient,
  ) { }

  /**
   * 发送带有验证token的请求
   * @param url       请求的链接
   * @param body      请求体
   * @returns {Observable<Object>}
   */
  public post(url: string, body: any | null): Observable<Object> {
    return this.http.post(url, body, {headers: this.headers});
  }

  /**
   * 发送get请求
   * @param {string} url              请求的链接
   * @returns {Observable<Object>}
   */
  public get(url: string): Observable<Object> {
    return this.http.get(url, {headers: this.headers});
  }

}

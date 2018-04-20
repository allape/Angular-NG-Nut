import {Injectable, Injector} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {ErrorObservable} from 'rxjs/observable/ErrorObservable';
import {catchError} from 'rxjs/operators';
import {mergeMap} from 'rxjs/operators';
import {NzMessageService} from 'ng-zorro-antd';
import {Utils} from '../utils/utils';

@Injectable()
export class InterceptorService implements HttpInterceptor {

  constructor(
    private injector:     Injector,
    private msg:          NzMessageService,
  ) { }

  /**
   * 拦截器
   * @param {HttpRequest<any>} req          请求对象
   * @param {HttpHandler} next              下一步操作
   * @returns {Observable<HttpEvent<any>>}
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      // 处理完成的时候
      mergeMap((event: any) => {
        if (event instanceof HttpResponse && event.status !== 200) {
          return ErrorObservable.create(event);
        }
        return Observable.create(observer => observer.next(event));
      }),
      // 捕捉错误
      catchError((res: HttpResponse<any>) => {
        if (Utils.referencable(res)) {
          // 根据不同的错误进行处理
          switch (res.status) {
            case 401:
              break;
            case 200:
              break;
            case 404:
              break;
            case 403:
              break;
            case 500:
              break;
          }
          this.msg.error('服务器错误! code: ' + (res.status ? res.status : '未指定响应代号!'));
        }
        return ErrorObservable.create(event);
      })
    );
  }
}

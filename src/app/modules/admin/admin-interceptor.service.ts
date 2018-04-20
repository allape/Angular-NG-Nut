import {Injectable, Injector} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {ErrorObservable} from 'rxjs/observable/ErrorObservable';
import {catchError} from 'rxjs/operators';
import {mergeMap} from 'rxjs/operators';
import {NzMessageService} from 'ng-zorro-antd';
import {CommonService} from '../../base/services/common.service';
import {ADMIN_ROUTES} from './services/admin.service';
import {Utils} from '../../base/utils/utils';
import {environment} from '../../../environments/environment';
import {ADMIN_TOKEN_SERVICE_NAME} from './services/token/admin-token.service';

@Injectable()
export class AdminInterceptorService implements HttpInterceptor {

  constructor(
    private injector:     Injector,
    private msg:          NzMessageService,
    private cs:           CommonService,
  ) { }

  /**
   * 拦截器
   * @param {HttpRequest<any>} req          请求对象
   * @param {HttpHandler} next              下一步操作
   * @returns {Observable<HttpEvent<any>>}
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 获取管理员Token服务
    const ats = this.cs.getRegisteredService(ADMIN_TOKEN_SERVICE_NAME);
    if (ats !== null) {
      const token = ats.getToken('Beaer WEB ');
      if (Utils.hasText(token)) {
        // 设置请求头
        req = req.clone({
          headers: req.headers.set('Authorization', token)
        });
      }
    }

    return next.handle(req).pipe(
      // 处理完成的时候
      mergeMap((event: any) => {
        // 检查基础参数
        if (event instanceof HttpResponse && event.status !== 200) {
          return ErrorObservable.create(event);
        }

        // 如果返回的code为未授权则跳转至登陆页面
        const body = Utils.referencable(event) && Utils.referencable(event.body) ? event.body : null;
        if (body !== null) {
          switch (body.code) {
            case environment.http.rescodes.ok: break;
            case environment.http.rescodes.notAuthed:
              this.cs.goto(ADMIN_ROUTES.login);
              break;
          }
        }

        return Observable.create(observer => observer.next(event));
      }),
      // 捕捉错误
      catchError((res: HttpResponse<any>) => {
        // 根据不同的错误进行处理
        switch (res.status) {
          case 200:
            break;
          // 未登录授权, 跳转至登录界面
          case 401:
            this.cs.goto(ADMIN_ROUTES.login);
            break;
          case 404:
            break;
          case 403:
            break;
          case 500:
            break;
        }
        return ErrorObservable.create(event);
      })
    );
  }

}

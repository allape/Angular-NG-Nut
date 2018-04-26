import {Injectable, Injector} from '@angular/core';
import {CommonService} from '../../../base/services/common.service';
import {Utils} from '../../../base/utils/utils';
import {HttpService} from '../../../base/services/http/http.service';
import {environment} from '../../../../environments/environment';
import {NzMessageService} from 'ng-zorro-antd';
import {Observable} from 'rxjs/Observable';
import {AdminTokenService} from './token/admin-token.service';

/**
 * 管理员平台的路由
 * @type {{login: string}}
 */
export const ADMIN_ROUTES = {
  // 登录界面
  login:        '/admin/passport/login',
  // 首页
  dashboard:    '/admin/dashboard/sys/role'
};

@Injectable()
export class AdminService {

  /**
   * 管理员登录token在localStorage中的key
   * @type {string}
   */
  private ADMIN_USER_TOKEN_LOCAL_STORAGE_KEY = 'as_ng_nut_admin_service_USER_DATA_LOCAL_STORAGE_KEY';

  /**
   * 当前登录的管理员
   * @type {null}
   */
  public user = null; // {username: 'test', id: 'testid', token: 'testToken', permissions: ['admin:home']}; // null;

  constructor(
    private injector:     Injector,
    private cs:           CommonService,
    private http:         HttpService,
    private msg:          NzMessageService,
    private ats:          AdminTokenService,
  ) { }

  /**
   * 设置当前登陆的管理员
   * @param {string} token      设置的token
   * @param {number} expires    token失效期(秒)
   */
  public loginUser(token?: string, expires?: number): Observable<Object> {
    // 设置token
    if (Utils.hasText(token) && Utils.referencable(expires)) {
      this.ats.setToken(token, expires);
    }
    // 返回订阅对象
    return new Observable<Object>((subscriber) => {
      // 获取管理员信息
      this.http.post(environment.modules.admin.http.urls.user.current, null).subscribe(
        (res: any) => {
          if (res.code === environment.modules.admin.http.rescodes.ok) {
            // 获取数据
            this.user = Utils.referencable(res.data) ? res.data : {};
            // TODO 临时的权限
            this.user.permissions = ['admin:home'];

            // 保存在localStorage中的信息
            const user = {
              id:             this.user.id,
              username:       this.user.username,
              token:          this.user.token,
            };
            // 放入localStorage
            window.localStorage.setItem(this.ADMIN_USER_TOKEN_LOCAL_STORAGE_KEY, JSON.stringify(user));

            // 触发回调
            subscriber.next(res);
          } else {
            this.msg.warning('获取您的信息失败! err: ' + res.msg);
            subscriber.error(res);
            this.gotoLogin();
          }
        },
        (e) => {
          subscriber.error(e);
        }
      );
    });
  }

  /**
   * 登出当前管理员
   */
  public logoutUser() {
    // TODO 登出接口需指定用户名
    this.http.delete(HttpService.buildUrl(environment.modules.admin.http.urls.auth.loginOut, this.getUser()['username'])).subscribe(
      () => {},
    );
    // 设置全局对象为null
    this.user = null;
    // 清除token
    this.ats.cleanToken();
    // 跳转至登陆界面
    return this.gotoLogin();
  }

  /**
   * 获取当前登录的管理员信息
   * @param {boolean} nonCheck      是否检查; false且当前管理员不存在, 则会跳转至登录界面
   * @param {Function} notLogined   没有对应登录的用户时候的回调, 返回true时才跳转至登录界面
   * @returns {any}
   */
  public getUser(nonCheck: boolean = false, notLogined?: Function) {
    if (this.user === null && !nonCheck) {
      if (!Utils.referencable(notLogined)) {
        this.gotoLogin();
      } else {
        if (notLogined.call(this)) {
          this.gotoLogin();
        }
      }
    }
    return this.user;
  }

  /**
   * 跳转至登录界面
   */
  public gotoLogin() {
    this.cs.goto(ADMIN_ROUTES.login);
  }

}

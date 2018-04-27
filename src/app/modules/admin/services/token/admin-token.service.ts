import {Injectable, Injector} from '@angular/core';
import {HttpService} from '../../../../base/services/http/http.service';
import {Utils} from '../../../../base/utils/utils';
import {AdminToken} from './admin.token';
import {CommonService} from '../../../../base/services/common.service';

/**
 * 缓存在localStorage中的管理员的token数据
 * @type {string}
 */
export const ADMIN_USER_TOKEN_LOCALSTORAGE_KEY = 'as_admin_ADMIN_USER_TOKEN_LOCALSTORAGE_KEY';

/**
 * 注册AdminTokenService到CommonService中的名称
 * @type {string}
 */
export const ADMIN_TOKEN_SERVICE_NAME = 'as_admin_AdminTokenService';

@Injectable()
export class AdminTokenService {

  /**
   * token数据
   */
  private token: AdminToken = null;

  constructor(
    private injector:         Injector,
    private http:             HttpService,
    private cs:               CommonService,
  ) {
    // 注册服务
    this.cs.registerService(ADMIN_TOKEN_SERVICE_NAME, this);
  }

  /**
   * 设置当前请求token
   * @param {string} token      设置的token
   * @param {number} expires    token失效期(秒)
   */
  public setToken(token: string, expires: number = 3600) {
    // 赋值
    this.token = {
      token: token,
      expires: expires,
      lastRenewalTime: Date.now() / 1000,
      expiredTime: 0,
    };
    this.token.expiredTime = this.token.lastRenewalTime + this.token.expires;

    // 写入localStorage
    window.localStorage.setItem(ADMIN_USER_TOKEN_LOCALSTORAGE_KEY, JSON.stringify(this.token));
  }

  /**
   * 获取token, 如果快要过期了, 则自动续期
   * @param prefix   返回的token字符串前面拼接的数据
   * @param suffix   返回的token字符串后面拼接的数据
   * @param {number} beforeTime 如果 ((上次续期时间 + 失效时间 - beforeTime(秒)) - 当前时间) < 0, 则调用续期接口
   */
  public getToken(prefix: string = '', suffix: string = '', beforeTime: number = 60) {
    // 如果服务中的token不存在, 则读取localStorage中的数据
    if (this.token === null) {
      try {
        // 读取localStorage
        const lsToken = JSON.parse(window.localStorage.getItem(ADMIN_USER_TOKEN_LOCALSTORAGE_KEY));
        // localStorage也不存在token时跳转至登录界面
        if (
          lsToken === null ||
          !Utils.hasText(lsToken.token) ||
          isNaN(lsToken.expires)
        ) {
          return null;
        }
        // 赋值
        this.token = lsToken;
      } catch (e) {
        console.error('整理localStorage已登录管理员失败! err', e);
      }
    }

    if (this.token.expiredTime - beforeTime < Date.now() / 1000) {
      setTimeout(
        () => {
          // 请求续租
          /*this.http.post('', null).subscribe(
            (res: any) => {
              if (Utils.referencable(res.data)) {
                this.setToken(res.data.token, res.data.expire);
              }
            }
          );*/
        }
      );
    }

    return prefix + this.token.token + suffix;
  }

  /**
   * 清除token
   */
  public cleanToken() {
    this.token = null;
    window.localStorage.removeItem(ADMIN_USER_TOKEN_LOCALSTORAGE_KEY);
  }

}

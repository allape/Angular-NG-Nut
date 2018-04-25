import {Component, OnDestroy, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {CommonService} from '../../../../base/services/common.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {environment} from '../../../../../environments/environment';
import {HttpService} from '../../../../base/services/http/http.service';
import {NzMessageService} from 'ng-zorro-antd';
import {ADMIN_ROUTES, AdminService} from '../../services/admin.service';
import {Utils} from '../../../../base/utils/utils';
import {Md5} from 'ts-md5';
import {fadein} from '../../../../app.animations';
import {AdminTokenService} from '../../services/token/admin-token.service';

@Component({
  selector: 'app-admin-passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    fadein
  ]
})
export class LoginComponent implements OnInit, OnDestroy {

  /**
   * 当前组件在自定义服务中注册器中的名称
   * @type {string}
   */
  private COMPONENT_NAME = 'AdminPassportLoginComponent';

  /**
   * 存放在localStorage的用户名的key
   * @type {string}
   */
  private USER_REMEMBERED_KEY = 'as_ng_nut_admin_passport_login_USER_REMEMBERED_KEY';

  /**
   * 登录表单
   */
  public loginForm: FormGroup;

  /**
   * 验证码图片
   * @type {string}
   */
  public verifycodeImg = '';

  constructor(
    private title:      Title,
    public  cs:         CommonService,
    private fb:         FormBuilder,
    public  http:       HttpService,
    private msg:        NzMessageService,
    private as:         AdminService,
  ) {
    // 设置标题
    this.title.setTitle('管理员登录');
  }

  ngOnInit() {
    // 注册组件
    this.cs.registerComponent(this.COMPONENT_NAME, this);

    // 初始化表单
    this.loginForm = this.fb.group({
      // 账号
      username:   [null, [Validators.required]],
      // 密码
      password:   [null, [Validators.required]],
      // 验证码
      captcha:    [null, [Validators.required]],
      // 记住我
      rememberme: [null, [Validators.required]],
      // 验证码的key
      key:        [''],
    });

    // 读取localStorage, 设置记住的用户名以及密码
    try {
      const user = JSON.parse(window.localStorage.getItem(this.USER_REMEMBERED_KEY));
      if (Utils.referencable(user)) {
        this.loginForm.patchValue({
          username:     (user['username'] ? user['username'] : '') + '',
          password:     (user['password'] ? user['password'] : '') + '',
          rememberme:   true
        });
      } else {
        this.loginForm.patchValue({
          rememberme:   false
        });
      }
    } catch (e) {
      console.error('获取localStorage的管理员登录信息失败! err:', e);
    }

    // 加载验证码
    this.loadVerfiyCodeImg();
  }

  ngOnDestroy(): void {
    // 解除组件
    this.cs.unregisterComponent(this.COMPONENT_NAME);
  }

  /**
   * 获取/刷新验证码
   */
  public loadVerfiyCodeImg() {
    // 请求网络
    this.http.get(environment.http.urls.auth.captcha, {
      notOkMsg: '获取验证码',
    }).subscribe(
      (res: any) => {
        this.verifycodeImg = this.cs.formatUnsafeURL(res.data.captcha);
        this.loginForm.controls.key.setValue(res.data.key);
      }
    );
  }

  /**
   * 请求登录
   */
  public login() {
    // 获取表单数据
    const data = this.loginForm.getRawValue();

    // 格式化数据
    if (data.password.length < 32) {
      data.password = Md5.hashStr(data.password).toString();
    }

    // 如果"记住我"选中了的, 则将用户名放入localStorage
    if (data.rememberme === true) {
      window.localStorage.setItem(this.USER_REMEMBERED_KEY, JSON.stringify(data));
    } else {
      window.localStorage.removeItem(this.USER_REMEMBERED_KEY);
    }

    // 请求登录
    this.http.post(environment.http.urls.auth.token, data, {
      notOkMsg:   '登录失败',
      okResponse: false,
    }).subscribe((res: any) => {
      if (res.code === environment.http.rescodes.ok) {
        this.as.loginUser(res.data.token, res.data.expire).subscribe(
          () => {
            this.cs.goto(ADMIN_ROUTES.dashboard);
          },
          (e) => {
            this.msg.warning('登录失败! err: ' + e.msg);
            // 刷新验证码
            this.loadVerfiyCodeImg();
          }
        );
      } else {
        this.msg.warning('登录失败! err: ' + res.msg);
        // 刷新验证码
        this.loadVerfiyCodeImg();
      }
    });
  }

}

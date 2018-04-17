import {Component, OnDestroy, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {CommonService} from '../../../../base/services/common.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {environment} from '../../../../../environments/environment';
import {HttpService} from '../../../../base/services/http.service';
import {NzMessageService} from 'ng-zorro-antd';
import {ADMIN_ROUTES, AdminService} from '../../admin.service';

@Component({
  selector: 'app-admin-passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
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
  private USERNAME_REMEMBERED_KEY = 'as_ng_nut_admin_passport_login_USERNAME_REMEMBER_KEY';

  /**
   * 登录表单
   */
  public loginForm: FormGroup;

  /**
   * 验证码图片
   * @type {string}
   */
  public verifycodeImg = environment.html.defaultImg;

  constructor(
    private title:      Title,
    public  cs:         CommonService,
    private fb:         FormBuilder,
    public  http:       HttpService,
    private msg:        NzMessageService,
    private as:         AdminService
  ) {
    // 设置标题
    this.title.setTitle('管理员登录');
  }

  ngOnInit() {
    // 注册组件
    this.cs.registerComponent(this.COMPONENT_NAME, this);

    // 初始化表单
    this.loginForm = this.fb.group({
      username:   [null, [Validators.required]],
      password:   [null, [Validators.required]],
      verifycode: [null, [Validators.required]],
      rememberme: [null, [Validators.required]],
    });

    // 读取localStorage, 设置用户名
    const un = window.localStorage.getItem(this.USERNAME_REMEMBERED_KEY);
    if (un != null) {
      this.loginForm.patchValue({
        username:     un,
        rememberme:   true
      });
    } else {
      this.loginForm.patchValue({
        rememberme:   false
      });
    }
  }

  ngOnDestroy(): void {
    // 解除组件
    this.cs.unregisterComponent(this.COMPONENT_NAME);
  }

  /**
   * 请求登录
   */
  public login() {
    // 获取表单数据
    const data = this.loginForm.getRawValue();

    // 如果"记住我"选中了的, 则将用户名放入localStorage
    if (data.rememberme === true) {
      window.localStorage.setItem(this.USERNAME_REMEMBERED_KEY, data.username);
    } else {
      window.localStorage.removeItem(this.USERNAME_REMEMBERED_KEY);
    }

    this.http.post(environment.http.urls.auth.token, {
      username: data.username,
      password: data.password,
    }).subscribe((res: any) => {
      if (res.code === environment.http.rescodes.ok) {
        this.as.loginUser(res.data.token).subscribe(
          () => {
            this.cs.goto(ADMIN_ROUTES.dashboard);
          },
          (e) => {
            this.msg.warning('登录失败! err: ' + e.msg);
          }
        );
      } else {
        this.msg.warning('登录失败, ' + res.msg);
      }
    });
  }

}

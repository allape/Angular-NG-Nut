import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {ADMIN_ROUTES, AdminService} from '../admin.service';
import {CommonService} from '../../../../base/services/common.service';
import {Injectable} from '@angular/core';

@Injectable()
export class PermissionGuard implements CanActivate {

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean> | Promise<boolean> | boolean {
    // 返回异步订阅
    return new Observable<boolean>(
      (subscriber) => {
        // 获取管理员信息
        if (this.as.getUser(true) === null) {
          // 打开遮罩
          this.cs.mask = true;
          // 请求登录
          this.as.loginUser().subscribe(
            () => {
              // 通知守卫放行
              subscriber.next(true);
              // 关闭mask
              this.cs.mask = false;
              this.cs.goto(ADMIN_ROUTES.dashboard);
            },
            () => {
              // 通知守卫拦截
              subscriber.next(false);
              // 关闭mask
              this.cs.mask = false;
              this.as.gotoLogin();
            }
          );
        } else {
          // 用户存在则放行
          subscriber.next(true);
        }
      }
    );
  }

  constructor(
    private as:         AdminService,
    private cs:         CommonService
  ) {}

}

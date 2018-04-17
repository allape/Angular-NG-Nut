import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DashboardRoutingModule} from './dashboard-routing.module';
import { HomeComponent } from './home/home.component';
import {ADMIN_ROUTES, AdminService} from '../admin.service';
import {CommonService} from '../../../base/services/common.service';
import { DashboardComponent } from './dashboard.component';
import {NzLayoutModule, NzMenuModule} from 'ng-zorro-antd';

@NgModule({
  imports: [
    // 公共
    CommonModule,
    // 路由
    DashboardRoutingModule,
    // zorro
    NzLayoutModule,
    NzMenuModule
  ],
  declarations: [
    HomeComponent,
    DashboardComponent
  ]
})
export class DashboardModule {

  constructor(
    private as:         AdminService,
    private cs:         CommonService,
  ) {
    // 获取管理员信息
    if (this.as.getUser(true) === null) {
      // 打开遮罩
      this.cs.mask = true;
      // 请求登录
      this.as.loginUser().subscribe(
        () => {
          // 关闭mask
          this.cs.mask = false;
          this.cs.goto(ADMIN_ROUTES.dashboard);
        },
        () => {
          // 关闭mask
          this.cs.mask = false;
          this.as.gotoLogin();
        }
      );
      throw new Error('未鉴权进入dashboard!');
    }
  }

}

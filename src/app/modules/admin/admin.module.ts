import { NgModule } from '@angular/core';
import {AdminRoutingModule} from './admin-routing.module';
import {AdminService} from './services/admin.service';
import {PermissionGuard} from './services/permission/permission.guard';
import {HttpService} from '../../base/services/http/http.service';
import {environment} from '../../../environments/environment';
import {AdminTokenService} from './services/token/admin-token.service';

@NgModule({
  imports: [
    AdminRoutingModule,
  ],
  declarations: [],
  providers: [
    // 网络服务
    HttpService,
    // 管理员服务
    AdminService,
    // 管理员鉴权token管理服务
    AdminTokenService,
    // 权限守卫; 没登录不让进dashboard
    PermissionGuard,
  ]
})
export class AdminModule {

  constructor(
    private http:           HttpService,
  ) {
    // 初始化http.service的配置
    this.http.host =                environment.modules.admin.http.host;
    this.http.msgHandler.okCode =   environment.modules.admin.http.rescodes.ok;
  }

}

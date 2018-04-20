import { NgModule } from '@angular/core';
import {AdminRoutingModule} from './admin-routing.module';
import {AdminService} from './services/admin.service';
import {PermissionGuard} from './services/permission/permission.guard';
import {HttpService} from '../../base/services/http.service';
import {environment} from '../../../environments/environment';
import {AdminTokenService} from './services/token/admin-token.service';

@NgModule({
  imports: [
    AdminRoutingModule,
  ],
  declarations: [],
  providers: [
    AdminService,
    AdminTokenService,
    PermissionGuard,
  ]
})
export class AdminModule {

  constructor(
    private http:           HttpService,
  ) {
    // 初始化http.service的配置
    this.http.responseMsgConfig.okCode = environment.http.rescodes.ok;
  }

}

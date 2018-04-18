import { NgModule } from '@angular/core';
import {AdminRoutingModule} from './admin-routing.module';
import {AdminService} from './admin.service';
import {PermissionGuard} from './dashboard/core/permission/permission.guard';
import {HttpService} from '../../base/services/http.service';
import {environment} from '../../../environments/environment';

@NgModule({
  imports: [
    AdminRoutingModule,
  ],
  declarations: [],
  providers: [
    AdminService,
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

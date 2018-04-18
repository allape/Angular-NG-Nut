import { NgModule } from '@angular/core';
import {AdminRoutingModule} from './admin-routing.module';
import {AdminService} from './admin.service';
import {PermissionGuard} from './dashboard/core/permission/permission.guard';

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
export class AdminModule { }

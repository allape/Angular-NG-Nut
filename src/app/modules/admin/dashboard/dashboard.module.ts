import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DashboardRoutingModule} from './dashboard-routing.module';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard.component';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import { PermissionDirective } from '../services/permission/permission.directive';
import {MenuService} from './sys/services/menu.service';
import {PUBLIC_COMPONENTS} from './public/public.import';

@NgModule({
  imports: [
    // 公共
    CommonModule,
    // 路由
    DashboardRoutingModule,
    // zorro
    NgZorroAntdModule,
  ],
  declarations: [
    HomeComponent,
    DashboardComponent,
    PermissionDirective,
    ...PUBLIC_COMPONENTS,
  ],
  providers: [
    MenuService
  ]
})
export class DashboardModule {

  constructor() { }

}

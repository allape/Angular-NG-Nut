import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {UserComponent} from './user/user.component';
import {SysRoutingModule} from './sys-routing.module';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  imports: [
    // 公共
    CommonModule,
    // 路由
    SysRoutingModule,
    // 表单模块
    ReactiveFormsModule,
    // ng-zorro
    NgZorroAntdModule,
  ],
  declarations: [
    UserComponent
  ]
})
export class SysModule { }

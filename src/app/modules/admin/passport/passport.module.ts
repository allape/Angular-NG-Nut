import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import {PassportRoutingModule} from './passport-routing.module';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@NgModule({
  imports: [
    // 公共模块
    CommonModule,
    // 路由
    PassportRoutingModule,
    // 表单模块
    ReactiveFormsModule,
    // zorro模块
    NgZorroAntdModule
  ],
  declarations: [
    LoginComponent,
  ]
})
export class PassportModule { }

import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import {PassportRoutingModule} from './passport-routing.module';
import {NzButtonModule, NzCardModule, NzFormModule, NzGridModule, NzInputModule, NzLayoutModule} from 'ng-zorro-antd';
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
    NzGridModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzLayoutModule,
    NzButtonModule,
  ],
  declarations: [
    LoginComponent,
  ]
})
export class PassportModule { }

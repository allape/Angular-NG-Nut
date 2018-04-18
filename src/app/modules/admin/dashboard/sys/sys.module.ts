import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {UserComponent} from './user/user.component';
import {SysRoutingModule} from './sys-routing.module';

@NgModule({
  imports: [
    CommonModule,
    SysRoutingModule,
    NgZorroAntdModule,
  ],
  declarations: [
    UserComponent
  ]
})
export class SysModule { }

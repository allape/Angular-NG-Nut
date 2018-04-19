import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import { IndexComponent } from './index/index.component';
import {HomepageRoutingModule} from './homepage-routing.module';

@NgModule({
  imports: [
    // 公共模块
    CommonModule,
    // 路由
    HomepageRoutingModule,
    // ng-zorro模块
    NgZorroAntdModule,
  ],
  declarations: [
    IndexComponent
  ]
})
export class HomepageModule { }

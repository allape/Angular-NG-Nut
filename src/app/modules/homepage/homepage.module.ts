import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import { IndexComponent } from './index/index.component';
import {HomepageRoutingModule} from './homepage-routing.module';
import {HttpService} from '../../base/services/http/http.service';

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
  ],
  providers: [
    // 网络服务
    HttpService,
  ]
})
export class HomepageModule {

  constructor(
    private http:       HttpService,
  ) {
    this.http.host = 'http://192.168.2.49:8080';
    this.http.msgHandler.okCode = '200001';
  }

}

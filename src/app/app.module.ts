import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {RouterModule, Routes} from '@angular/router';
import {TASK_FLOW, TaskComponent} from './home/task.component';
import {environment} from '@env/environment';
import {CommonService} from './home/services/common.service';
import {MyMqttService} from './home/services/myMqtt.service';
import {TaskService} from './home/services/task.service';
import {HttpClientModule} from '@angular/common/http';

// 路由配置
const routes: Routes = [
  {
    path: 'home',
    component: TaskComponent
  },
  {path: '**', component: TaskComponent},
];

// region: zorro modules

import {
  // LoggerModule,
  // NzLocaleModule,
  NzButtonModule,
  NzAlertModule,
  NzBadgeModule,
  // NzCalendarModule,
  NzCascaderModule,
  NzCheckboxModule,
  NzDatePickerModule,
  NzFormModule,
  NzInputModule,
  NzInputNumberModule,
  NzGridModule,
  NzMessageModule,
  NzModalModule,
  NzNotificationModule,
  NzPaginationModule,
  NzPopconfirmModule,
  NzPopoverModule,
  NzRadioModule,
  NzRateModule,
  NzSelectModule,
  NzSpinModule,
  NzSliderModule,
  NzSwitchModule,
  NzProgressModule,
  NzTableModule,
  NzTabsModule,
  NzTagModule,
  NzTimePickerModule,
  NzUtilModule,
  NzStepsModule,
  NzDropDownModule,
  NzMenuModule,
  NzBreadCrumbModule,
  NzLayoutModule,
  NzRootModule,
  NzCarouselModule,
  // NzCardModule,
  NzCollapseModule,
  NzTimelineModule,
  NzToolTipModule,
  // NzBackTopModule,
  // NzAffixModule,
  // NzAnchorModule,
  NzAvatarModule,
  NzUploadModule,
  // SERVICES
  NzNotificationService,
  NzMessageService, NzTransferModule, NzCardModule
} from 'ng-zorro-antd';
import {HttpService} from 'app/home/services/http.service';
import {SettingsService} from './home/services/settings.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

export const ZORROMODULES = [
  // LoggerModule,
  // NzLocaleModule,
  NzButtonModule,
  NzAlertModule,
  NzBadgeModule,
  // NzCalendarModule,
  NzCascaderModule,
  NzCheckboxModule,
  NzDatePickerModule,
  NzFormModule,
  NzInputModule,
  NzInputNumberModule,
  NzGridModule,
  NzMessageModule,
  NzModalModule,
  NzNotificationModule,
  NzPaginationModule,
  NzPopconfirmModule,
  NzPopoverModule,
  NzRadioModule,
  NzRateModule,
  NzSelectModule,
  NzSpinModule,
  NzSliderModule,
  NzSwitchModule,
  NzProgressModule,
  NzTableModule,
  NzTabsModule,
  NzTagModule,
  NzTransferModule,
  NzTimePickerModule,
  NzUtilModule,
  NzStepsModule,
  NzDropDownModule,
  NzMenuModule,
  NzBreadCrumbModule,
  NzLayoutModule,
  NzRootModule,
  NzCarouselModule,
  NzCardModule,
  NzCollapseModule,
  NzTimelineModule,
  NzToolTipModule,
  // NzBackTopModule,
  // NzAffixModule,
  // NzAnchorModule,
  NzAvatarModule,
  NzUploadModule
];

// endregion

@NgModule({
  declarations: [
    // app模块
    AppComponent,
    // 自定义模块
    TaskComponent,
    ...TASK_FLOW,
  ],
  imports: [
    // 浏览器模块
    BrowserModule,
    BrowserAnimationsModule,
    // 路由模块,
    RouterModule.forRoot(routes, {useHash: environment.ROUTER.useHash, enableTracing: environment.ROUTER.enableTracing}),
    // 网络服务
    HttpClientModule,
    // zorro模块
    ...ZORROMODULES,
  ],
  exports: [RouterModule],
  providers: [
    // 消息通知
    NzMessageService,
    NzNotificationService,
    // 自定义服务
    // 公共服务, 提供一些共用方法
    CommonService,
    // MQTT服务, 封装原有的mqtt, 实现输出自己的log
    MyMqttService,
    // 任务服务, 用于初始化MQTT监听等
    TaskService,


    // 临时业务服务
    HttpService,
    SettingsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

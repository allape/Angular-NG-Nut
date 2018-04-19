import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {IndexComponent} from './index/index.component';

// 路由配置
const routes: Routes = [
  {path: 'index', component: IndexComponent, data: {title: '首页'}},
  {path: '**',    redirectTo: 'index'},
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class HomepageRoutingModule { }

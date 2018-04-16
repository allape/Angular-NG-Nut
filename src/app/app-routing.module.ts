import {AdminModule} from './modules/admin/admin.module';
import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {environment} from '../environments/environment';

// 路由配置
const routes: Routes = [
  {path: 'admin', loadChildren: () => AdminModule},
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, {useHash: environment.router.useHash, enableTracing: environment.router.enableTracing})],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }

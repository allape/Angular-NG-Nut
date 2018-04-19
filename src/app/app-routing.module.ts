import {AdminModule} from './modules/admin/admin.module';
import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {environment} from '../environments/environment';
import {HomepageModule} from './modules/homepage/homepage.module';
import {ClientModule} from './modules/client/client.module';

// 路由配置
const routes: Routes = [
  {path: 'admin',     loadChildren: () => AdminModule},
  {path: 'homepage',  loadChildren: () => HomepageModule},
  {path: 'client',    loadChildren: () => ClientModule},
  {path: '**',        redirectTo: 'homepage'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: environment.router.useHash, enableTracing: environment.router.enableTracing})],
  exports: [RouterModule]
})
export class AppRoutingModule { }

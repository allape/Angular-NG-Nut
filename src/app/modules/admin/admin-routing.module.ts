import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PassportModule} from './passport/passport.module';
import {DashboardModule} from './dashboard/dashboard.module';
import {PermissionGuard} from './dashboard/core/permission/permission.guard';

const routes: Routes = [
  {path: 'passport', loadChildren: () => PassportModule},
  {path: 'dashboard', loadChildren: () => DashboardModule, canActivate: [PermissionGuard]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule { }

import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PassportModule} from './passport/passport.module';
import {DashboardModule} from './dashboard/dashboard.module';

const routes: Routes = [
  {path: 'passport', loadChildren: () => PassportModule},
  {path: 'dashboard', loadChildren: () => DashboardModule},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

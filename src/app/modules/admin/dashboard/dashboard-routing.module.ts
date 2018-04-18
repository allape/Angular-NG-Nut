import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {DashboardComponent} from './dashboard.component';
import {SysModule} from './sys/sys.module';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent ,
    data: {title: '管理平台'},
    children: [
      {path: 'home', component: HomeComponent , data: {title: '管理员首页'}},
      {path: 'sys', loadChildren: () => SysModule},
    ]
  },
  {path: '**', redirectTo: ''},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }

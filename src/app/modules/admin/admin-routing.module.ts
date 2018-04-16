import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PassportModule} from './passport/passport.module';

const routes: Routes = [
  {path: 'passport', loadChildren: () => PassportModule},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import {PassportRoutingModule} from './passport-routing.module';

@NgModule({
  imports: [
    PassportRoutingModule
  ],
  declarations: [
    LoginComponent,
  ]
})
export class PassportModule { }

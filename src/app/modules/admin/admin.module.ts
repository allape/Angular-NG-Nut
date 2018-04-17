import { NgModule } from '@angular/core';
import {AdminRoutingModule} from './admin-routing.module';
import {AdminService} from './admin.service';

@NgModule({
  imports: [
    AdminRoutingModule,
  ],
  declarations: [],
  providers: [
    AdminService
  ]
})
export class AdminModule { }

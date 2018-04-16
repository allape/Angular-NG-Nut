import { Component } from '@angular/core';
import {CommonService} from './base/services/common.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {

  constructor(
    public  cs:           CommonService
  ) { }

}

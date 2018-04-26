import { Component } from '@angular/core';
import {CommonService} from './base/services/common.service';
import {fadein} from './app.animations';

@Component({
  selector: 'app-root',
  template: `
    <!-- 路由入口 -->
    <router-outlet></router-outlet>
    <!-- 全局loading -->
    <div @fadein *ngIf="cs.mask" id="loadingMask"><nz-spin [nzSize]="'large'" class="d-inline-block mr-sm"></nz-spin></div>
  `,
  styleUrls: ['./app.component.css'],
  animations: [
    fadein
  ]
})
export class AppComponent {

  constructor(
    public  cs:           CommonService
  ) { }

}

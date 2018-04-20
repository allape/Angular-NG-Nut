import { Component } from '@angular/core';
import {CommonService} from './base/services/common.service';

@Component({
  selector: 'app-root',
  template: `
    <!-- 路由入口 -->
    <router-outlet></router-outlet>
    <!-- 全局loading -->
    <div *ngIf="cs.mask" id="loadingMask"><nz-spin [nzSize]="'large'" class="d-inline-block mr-sm"></nz-spin></div>
  `,
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  constructor(
    public  cs:           CommonService
  ) { }

}

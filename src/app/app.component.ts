import { Component } from '@angular/core';
import {CommonService} from './base/services/common.service';

@Component({
  selector: 'app-root',
  template: `
    <!-- 路由入口 -->
    <router-outlet></router-outlet>
    <!-- 全局loading -->
    <div *ngIf="cs.mask" id="loadingMask">
      <nz-spin [nzSize]="'large'" class="d-inline-block mr-sm"></nz-spin>
    </div>
  `,
  styles: [
    `
      /* mask */
      :host ::ng-deep #loadingMask {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0px;
        left: 0px;
        background-color: rgba(255, 255, 255, 0.3);
        z-index: 1000000;
      }
      :host ::ng-deep #loadingMask > nz-spin {
        position: fixed;
        top: 45%;
        left: 50%;
      }
    `
  ]
})
export class AppComponent {

  constructor(
    public  cs:           CommonService
  ) { }

}

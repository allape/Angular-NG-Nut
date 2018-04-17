import {Component, OnDestroy, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {CommonService} from '../../../base/services/common.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  // TODO 更改样式

  private COMPONENT_NAME = 'AdminDashboardComponent';

  /**
   * 菜单是否折叠
   * @type {boolean}
   */
  public isCollapsed = false;

  constructor(
    private title:            Title,
    private cs:               CommonService,
  ) {
    this.title.setTitle('管理平台');
  }

  ngOnInit() {
    this.cs.registerComponent(this.COMPONENT_NAME, this);
  }

  ngOnDestroy(): void {
    this.cs.unregisterComponent(this.COMPONENT_NAME);
  }

}

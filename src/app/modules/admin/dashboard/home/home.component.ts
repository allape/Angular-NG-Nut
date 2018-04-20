import {Component, OnDestroy, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {CommonService} from '../../../../base/services/common.service';
import {fadeInFromDown2Up} from '../../../../app.animations';

@Component({
  selector: 'app-admin-dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    fadeInFromDown2Up
  ]
})
export class HomeComponent implements OnInit, OnDestroy {

  private COMPONENT_NAME = 'AdminDashBoardHomeComponent';

  constructor(
    private title:          Title,
    private cs:             CommonService,
  ) {
    this.title.setTitle('管理员首页');
  }

  ngOnInit() {
    this.cs.registerComponent(this.COMPONENT_NAME, this);
  }

  ngOnDestroy(): void {
    this.cs.unregisterComponent(this.COMPONENT_NAME);
  }

}

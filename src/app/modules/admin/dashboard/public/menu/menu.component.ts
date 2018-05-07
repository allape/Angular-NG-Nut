import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-admin-dashboard-public-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  @Input('menus')
  public menus = [];

  constructor() { }

  ngOnInit() {

  }

  /**
   * 检查对象是否数组
   * @param o     检查对象
   * @returns {boolean}   true: 是; false: 不是;
   */
  public isArray(o: any) {
    return o instanceof Array;
  }

}

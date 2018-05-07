import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {CommonService} from '../../../base/services/common.service';
import {AdminService} from '../services/admin.service';
import {fadeInFromDown2Up} from '../../../app.animations';
import {NzMenuComponent, NzMenuItemComponent} from 'ng-zorro-antd';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    fadeInFromDown2Up
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {

  private COMPONENT_NAME = 'AdminDashboardComponent';

  /**
   * 菜单是否折叠
   * @type {boolean}
   */
  public isCollapsed = true;

  // region 彩虹渐变需要的变量

  // 彩虹的颜色
  rainbow = {
    red:      0xff0000,
    orange:   0xffa500,
    yellow:   0xffff00,
    green:    0x00ff00,
    cyan:     0x007fff,
    blue:     0x0000ff,
    purple:   0xbb00ff,
  };

  // 初始化颜色为红色
  changingColor = this.rainbow.red;
  // 计时器标识符
  changingColorFlag;
  // 渐变顺序, true: 红到紫, false: 紫到红
  positiveWay = true;
  // 颜色层级
  colorStage = this.rainbow.red;
  // 是否开始彩虹渐变
  rainbowStarted = false;

  // endregion

  /**
   * 菜单
   */
  public menus;

  constructor(
    private title:            Title,
    private cs:               CommonService,
    public  as:               AdminService,
  ) {
    // 设置标题
    this.title.setTitle('管理平台');
    // 获取菜单
    this.menus = this.as.getUser().menus;
  }

  ngOnInit() {
    this.cs.registerComponent(this.COMPONENT_NAME, this);
  }

  ngOnDestroy(): void {
    this.cs.unregisterComponent(this.COMPONENT_NAME);
  }

  // region 彩虹渐变

  /**
   * 启动彩虹颜色
   */
  public startRainbowColor() {
    if (this.rainbowStarted) {
      window.cancelAnimationFrame(this.changingColorFlag);
    } else {
      this.changingColorFlag = window.requestAnimationFrame(this.changeColor.bind(this));
    }
    this.rainbowStarted = !this.rainbowStarted;
  }

  /**
   * 更改下一帧的颜色
   */
  public changeColor() {
    // 转换为css识别的16进制
    let colorHex = this.changingColor.toString(16);
    colorHex = '#' + (colorHex.length < 6 ? Array(7 - colorHex.length).join('0') : '') + colorHex;

    // 获取控件并赋值
    // 侧菜单
    const aside = document.body.querySelector('nz-sider');
    if (aside !== null && aside['style']) {
      aside['style'].backgroundColor = colorHex;
      // 菜单
      const menus = aside.querySelectorAll('.ant-menu');
      for (let i = 0; i < menus.length; i++) {
        menus[i]['style'].backgroundColor = colorHex;
      }
    }

    // 整理并计算下一阶段的颜色, 红橙黄绿青蓝紫
    // 赤 --> 黄
    if (this.colorStage === this.rainbow.red) {
      this.changingColor += (this.positiveWay ? 1 : -1) * 0x000100;
      if (this.changingColor === this.rainbow.red) {
        this.positiveWay = true;
      }
      if (this.changingColor === this.rainbow.yellow) {
        this.colorStage = this.rainbow.yellow;
      }
    }
    // 黄 --> 绿
    if (this.colorStage === this.rainbow.yellow) {
      this.changingColor += (this.positiveWay ? -1 : 1) * 0x010000;
      if (this.changingColor === this.rainbow.yellow) {
        this.colorStage = this.rainbow.red;
      }
      if (this.changingColor === this.rainbow.green) {
        this.colorStage = this.rainbow.green;
      }
    }
    // 绿 --> 蓝
    if (this.colorStage === this.rainbow.green) {
      this.changingColor += (this.positiveWay ? -1 : 1) * (0x000100 - 0x000001);
      if (this.changingColor === this.rainbow.green) {
        this.colorStage = this.rainbow.yellow;
      }
      if (this.changingColor === this.rainbow.blue) {
        this.colorStage = this.rainbow.blue;
      }
    }
    // 蓝 --> 紫
    if (this.colorStage === this.rainbow.blue) {
      this.changingColor += (this.positiveWay ? 1 : -1) * 0x010000;
      if (this.changingColor === this.rainbow.purple) {
        this.positiveWay = false;
      }
      if (this.changingColor === this.rainbow.blue) {
        this.colorStage = this.rainbow.green;
      }
    }

    this.changingColorFlag = window.requestAnimationFrame(this.changeColor.bind(this));
  }

  // endregion

  /**
   * 登出
   */
  public logout() {
    this.as.logoutUser();
  }

}

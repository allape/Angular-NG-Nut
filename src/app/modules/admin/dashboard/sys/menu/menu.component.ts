import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ComponentBase} from '../../../../../base/component/component.base';
import {CommonService} from '../../../../../base/services/common.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Title} from '@angular/platform-browser';
import {HttpService} from '../../../../../base/services/http/http.service';
import {NzMessageService, NzModalService} from 'ng-zorro-antd';
import {Utils} from '../../../../../base/utils/utils';
import {environment} from '../../../../../../environments/environment';
import {fadein, flyIn} from '../../../../../app.animations';

@Component({
  selector: 'app-admin-dashboard-sys-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  animations: [
    fadein, flyIn
  ]
})
export class MenuComponent extends ComponentBase implements OnInit, OnDestroy {

  // TODO 完善菜单管理

  private COMPONENT_NAME = 'AdminDashboardSysMenuComponent';

  // 菜单列表
  public list = [];

  // 添加修改表单对象
  public additForm: FormGroup;

  /**
   * 是否显示修改添加区域内容
   * @type {boolean}
   */
  public showAdditContent = false;

  /**
   * 是否显示刷新按钮, 用于列表加载失败后显示
   * @type {boolean}
   */
  public showRefreshBtn = false;

  constructor(
    public  http:   HttpService,
    public  cs:     CommonService,
    private title:  Title,
    private msg:    NzMessageService,
    private fb:     FormBuilder,
    private modal:  NzModalService,
  ) {
    super();

    // 设置标题
    this.title.setTitle('菜单管理');

    // 获取菜单列表
    this.getList();

    // 初始化表单
    this.additForm = fb.group({
      // id
      id:           [null],
      // 父级菜单id
      parentId:     [null],
      // 菜单名称
      menuName:     [null, [Validators.required]],
    });
  }

  ngOnInit() {
    this.cs.registerComponent(this.COMPONENT_NAME, this);
  }

  ngOnDestroy(): void {
    this.cs.unregisterComponent(this.COMPONENT_NAME);
  }

  /**
   * 获取列表
   */
  public getList() {
    this.http.post(
      environment.modules.admin.http.urls.menu.list,
      null,
      {notOkMsg: '获取菜单列表失败'}
      ).subscribe(
      (res: any) => {
        // 隐藏按钮
        this.showRefreshBtn = false;
        // 赋值
        this.list = res.data;
      },
      () => {
        this.showRefreshBtn = true;
      }
    );
  }

  /**
   * 列表中的菜单选中事件
   * @param e
   */
  public onListMenuSelected(e) {
    console.log(e);
    this.showAdditContent = true;
  }

}

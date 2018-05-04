import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ComponentBase} from '../../../../../base/component/component.base';
import {CommonService} from '../../../../../base/services/common.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Title} from '@angular/platform-browser';
import {HttpService} from '../../../../../base/services/http/http.service';
import {NzMessageService, NzModalService} from 'ng-zorro-antd';
import {Utils} from '../../../../../base/utils/utils';
import {environment} from '../../../../../../environments/environment';
import {fadein} from '../../../../../app.animations';
import {MenuService} from '../services/menu.service';
import {ValidationErrors} from '@angular/forms/src/directives/validators';

/**
 * 顶级菜单的parentId
 * @type {string}
 */
export const TOP_MENU_LEVEL_ID = '0';

@Component({
  selector: 'app-admin-dashboard-sys-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  animations: [
    fadein,
  ]
})
export class MenuComponent extends ComponentBase implements OnInit, OnDestroy {


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
   * 是否显示修改添加区域内容中的删除按钮
   * @type {boolean}
   */
  public showDelBtn = false;

  /**
   * 是否显示刷新按钮, 用于列表加载失败后显示
   * @type {boolean}
   */
  public showRefreshBtn = false;

  /**
   * 菜单选择器ng对象
   */
  @ViewChild('menuSelector')
  public menuSelectorNg;

  /**
   * 菜单选择器modal
   */
  public menuSelectorModal;

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
      id:             [null],
      // 父级菜单id
      parentId:       [null],
      // 菜单类型
      menuType:       ['0', [Validators.required]],
      // 菜单名称
      menuName:       [null, [Validators.required]],
      // 菜单父菜单名称
      menuParentName: [null, (): ValidationErrors | null => {
        if (Utils.referencable(this.additForm) && Utils.hasText(this.additForm.controls.id.value)) {
          if (this.additForm.controls.id.value === this.additForm.controls.parentId.value) {
            return {checked: true};
          }
        }
        return null;
      }],
      // 菜单权限
      menuPerms:      [null],
      // 菜单链接
      menuHref:       [null],
      // 菜单图标
      menuIcon:       [null],
      // 菜单序号
      menuSort:       [null],
    });

    // 给菜单类型添加修改事件, 更改之后显示不同的内容和不同的表单校验
    this.additForm.controls.menuType.valueChanges.subscribe(
      value => {
        switch (value) {
          // 菜单
          case '1':
            // 添加必填效验
            this.additForm.controls.menuHref.setValidators([Validators.required]);
            break;
          // 目录
          case '0':
          // 按钮
          case '2':
            // 掉其效验
            this.additForm.controls.menuHref.clearValidators();
            this.additForm.controls.menuHref.setValue(null);
            break;
        }
      }
    );
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
    // 隐藏修改添加框和删除按钮
    this.showAdditContent = false;
    this.showDelBtn = false;

    this.http.post(
      environment.modules.admin.http.urls.menu.list,
      null,
      {notOkMsg: '获取菜单列表失败'}
      ).subscribe(
      (res: any) => {
        // 隐藏按钮
        this.showRefreshBtn = false;
        // 赋值
        this.list = MenuService.formatMenus(res.data, TOP_MENU_LEVEL_ID, 'menuSort');
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
    // 重置数据
    this.additForm.reset();

    // 设置菜单父级菜单名称
    this.additForm.controls.menuParentName.setValue(e.node.parent.data.menuName);

    // 显示添加修改框
    this.showAdditContent = true;
    // 显示添加修改框
    this.showDelBtn = true;
    // 赋值
    this.additForm.patchValue(e.node.data);
  }

  /**
   * 显示添加菜单内容
   */
  public showAddContent() {
    // 显示html
    this.showAdditContent = true;
    // 隐藏删除按钮
    this.showDelBtn = false;
    // 重置表单
    this.additForm.reset();
    // 设置菜单类型为目录('0')
    this.additForm.controls.menuType.setValue('0');
  }

  /**
   * 保存数据; 根据id是否有值来判断是添加还是修改
   */
  public save() {
    // 获取数据
    const data = this.additForm.getRawValue();
    // 整理数据
    // 如果parentId为空字符串, 则默认设置为0
    data.parentId = Utils.hasText(data.parentId) ? data.parentId : TOP_MENU_LEVEL_ID;
    // 是否为添加; 只有id为空时才为添加
    const addFlag = !Utils.hasText(data.id);
    // 请求网络
    this.http.post(
      addFlag ? environment.modules.admin.http.urls.menu.save : environment.modules.admin.http.urls.menu.update,
      data,
      {notOkMsg: '保存菜单失败'}
    ).subscribe(
      () => {
        this.getList();
      }
    );
  }

  /**
   * 删除当前additForm中的菜单
   */
  public del() {
    // 获取参数
    const id = this.additForm.controls.id.value;
    // 检查参数
    if (!Utils.hasText(id)) {
      this.msg.warning('当前没有选中的菜单, 无法进行删除!');
      return;
    }
    // 请求网络
    this.http.delete(HttpService.buildUrl(environment.modules.admin.http.urls.menu.delete, {menuId: id})).subscribe(
      () => {
        this.getList();
      }
    );
  }

  /**
   * 弹出菜单选择器
   */
  public showMenuSelector() {
    this.menuSelectorModal = this.modal.open({
      title: '请选择父级菜单',
      content: this.menuSelectorNg,
      maskClosable: false,
      footer: false,
      style: {
        width: '300px'
      }
    });
  }

  /**
   * 菜单选择器选择事件
   * @param e
   */
  public onMenuSelectorSelected(e) {
    // 绑定数据
    this.additForm.controls.parentId.setValue(e.node.data.id);
    this.additForm.controls.menuParentName.setValue(e.node.data.menuName);
    // 关闭选择框
    this.menuSelectorModal.destroy();
  }

}

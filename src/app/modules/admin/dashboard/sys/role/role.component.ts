import {Component, OnInit, ViewChild} from '@angular/core';
import {fadein, fadeInFromDown2Up} from '../../../../../app.animations';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CommonService} from '../../../../../base/services/common.service';
import {Title} from '@angular/platform-browser';
import {NzMessageService, NzModalService} from 'ng-zorro-antd';
import {HttpService} from '../../../../../base/services/http/http.service';
import {REGEXP, Utils} from '../../../../../base/utils/utils';
import {environment} from '../../../../../../environments/environment';
import {ComponentBase} from '../../../../../base/component/component.base';
import {Observable} from 'rxjs/Observable';
import {debounceTime, map} from 'rxjs/operators';
import {MenuService} from '../services/menu.service';
import {TOP_MENU_LEVEL_ID} from '../menu/menu.component';

@Component({
  selector: 'app-admin-dashboard-sys-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css'],
  animations: [
    fadeInFromDown2Up, fadein
  ]
})
export class RoleComponent extends ComponentBase implements OnInit {

  // 角色列表
  public list = [];
  // 当前页码
  public currentPage = 1;
  // 每页数量
  public pageRowNum = 10;
  // 所有条数
  public totalRecords = 0;
  // 搜索参数
  public searchForm: FormGroup = new FormGroup({
    roleName: new FormControl(),
    roleCode: new FormControl(),
  });
  // 排序参数
  public sort = {
    predicate: '',
    reverse: false
  };


  // 全选
  _allChecked = false;
  _indeterminate = false;

  // 验证 roleCode
  oldRoleCode = '';


  // 添加修改Ng对象
  @ViewChild('additBox')
  public additBox;
  // 添加修改的弹窗对象
  public additModal;
  // 添加修改form
  public additForm: FormGroup;

  constructor(public  http: HttpService,
              public  cs: CommonService,
              private title: Title,
              private msg: NzMessageService,
              private fb: FormBuilder,
              private modal: NzModalService) {

    super();
    // 设置浏览器标题
    this.title.setTitle('角色管理');

    // 添加修改form 验证
    this.additForm = this.fb.group({
      // id
      id: [null],
      // 角色名称
      roleName: [null, [Validators.required]],
      // 角色编码
      roleCode: [null, [Validators.required],
        ((control: FormControl): Observable<any> => {
          return control.valueChanges.pipe(
            // 延时操作时间, 避免连续使用网络
            debounceTime(500),
            // 查询角色编码是否重复
            map((value) => {
              // 如果this.additTarget.id存在, 则表示是修改; 避免未修改用户名时提示'用户名已存在'
              if (Utils.hasText(this.additForm.controls.id.value)) {
                if (value === this.oldRoleCode) {
                  control.setErrors(null);
                  return;
                }
              }
              // 请求网络
              this.http.get(HttpService.buildUrl(environment.modules.admin.http.urls.role.codeExists, {roleCode: value})).subscribe(
                (res: any) => {
                  if (res.data === false) {
                    // 如果重名则设置对应的参数
                    control.setErrors({checked: true, error: true});
                  } else {
                    control.setErrors(null);
                  }    // 检查通过
                }
              );
            })
          );
        }).bind(this)],
      // 描述
      roleDesc: [null, [Validators.required]]
    });

    // 初始化菜单选择器
    this.initMenusSelector();
  }

  ngOnInit() {
    this.getList();
  }


  // 加载列表数据
  public getList(currentPage: number = 1) {
    this._allChecked = false;
    // 格式化数据
    this.currentPage = Utils.formatPageNum(currentPage, this.currentPage);
    // 获取数据
    this.http.post(
      environment.modules.admin.http.urls.role.list,
      {
        curentPage: this.currentPage,
        pageRowNum: this.pageRowNum,
        search: this.searchForm.getRawValue(),
        sort: this.sort,
      },
      {notOkMsg: '加载角色列表失败'}
    ).subscribe((res: any) => {
        this.list = res.data.data;
        this.currentPage = res.data['currentPage'];
        this.pageRowNum = res.data['pageSize'];
        this.totalRecords = res.data['totalRecords'];
      }
    );
  }


  /**
   *  保存或者修改角色
   */
  public saveOrUpdate() {
    // 获取表单数据
    const role = this.additForm.getRawValue();
    // 获取选择了的菜单数据
    const checkedMenus = [];
    this.getCheckedMenus(this.menus, checkedMenus);
    // 获取选中的菜单的id集合
    role['menuIdList'] = [];
    for (const cm of checkedMenus) {
      role['menuIdList'].push(cm.id);
    }

    // TODO 部门
    role['deptIdList'] = [];

    this.http.post(
      Utils.hasText(role.id) ? environment.modules.admin.http.urls.role.update : environment.modules.admin.http.urls.role.save,
      role
    ).subscribe((res: any) => {
      this.additModal.destroy();
      if (Utils.hasText(role.id)) {
        for (let i = 0; i < this.list.length; i++) {
          if (this.list[i].id === res.data.id) {
            this.list.splice(i, 1, res.data);
          }
        }
      } else {
        this.list.push(res.data);
      }
    });
  }


  /**
   * 显示添加修改弹窗
   * @param title           标题; 默认为"标题"
   * @param {string} data   回填的数据; 存在则是修改, 不存在则是修改
   */
  public showAdditBox(title?: string, data?: any) {
    // 重置表单
    this.additForm.reset();
    // 重置角色菜单选择器
    this.checkMenusSelector();

    // 打开添加修改弹出框
    const openModal = () => {
      this.additModal = this.modal.open({
        title: title ? title : '标题',
        content: this.additBox,
        maskClosable: false,
        footer: false,
        style: {
          width: '500px'
        }
      });
    };

    // 检查是修改还是添加
    if (Utils.referencable(data)) {
      // 加载角色详细信息: 包括菜单和部门
      this.getRoleInfo(data.id).subscribe(
        () => {
          // 回填数据
          this.additForm.patchValue(data);
          // 当前角色信息加载完成之后打开修改框
          openModal();
        }
      );
    } else {
      // 打开修改弹出框
      openModal();
    }
  }


  // 删除
  public del(ids?: String) {
    this.http.delete(HttpService.buildUrl(environment.modules.admin.http.urls.role.delete, ids), { notOkMsg: '', msgSeparator: ''}).subscribe((res: any) => {
        for (let i = 0; i < res.data.length; i++) {
          this.delRecursion(res.data[i]);
        }
        this._allChecked = false;
      });
  }

  // 递归移除元素
  public delRecursion(id?: String) {
    for (let i = 0; i < this.list.length; i++) {
      if (id === (this.list[i].id)) {
        this.list.splice(i, 1);
      }
    }
  }


  // 批量删除
  public batchDel() {
    let ids = '';
    this.list.forEach(list => {
      if (list.checked) {
        ids += list.id + ',';
      }
    });
    this.del(ids);
  }


  _displayDataChange($event) {
    this.list = $event;
    this._refreshStatus();
  }

  _refreshStatus() {
    const allChecked = this.list.every(value => value.checked === true);
    const allUnChecked = this.list.every(value => !value.checked);
    this._allChecked = allChecked;
    this._indeterminate = (!allChecked) && (!allUnChecked);
  }

  _checkAll(value) {
    if (value) {
      this.list.forEach(list => {
        list.checked = true;
      });
    } else {
      this.list.forEach(list => {
        list.checked = false;
      });
    }
    this._refreshStatus();
  }

  // region 当前角色缓存, 获取当前角色信息

  /**
   * 当前修改的角色
   */
  private currentRole;

  /**
   * 根据id获取角色信息
   * @param {string} id
   */
  private getRoleInfo(id: string): Observable<any> {
    return new Observable<any>(
      subscriber => {
        this.http.get(
          HttpService.buildUrl(environment.modules.admin.http.urls.role.info, id),
          {notOkMsg: '查询当前角色详情失败'}
        ).subscribe(
          (res: any) => {
            // 赋值
            this.currentRole = res.data;

            // 根据其中的角色菜单列表选中菜单
            this.checkMenusSelector(true, this.menus, this.currentRole['menuIdList']);

            // 通知订阅者继续
            subscriber.next();
          },
          error1 => {
            subscriber.error(error1);
          }
        );
      }
    );
  }

  // endregion

  // region 菜单选择

  /**
   * 缓存的菜单; 树形结构
   * @type {any[]}
   */
  public menus = [];

  /**
   * 初始化菜单选择器; 加载所有菜单到缓存
   */
  public initMenusSelector() {
    this.http.post(environment.modules.admin.http.urls.menu.list, null).subscribe(
      (res: any) => {
        this.menus = MenuService.formatMenus(res.data, TOP_MENU_LEVEL_ID, 'menuSort');
      }
    );
  }

  /**
   * 获取所有选中了的菜单
   * @param searchMenus                 搜索的菜单
   * @param {Array<any>} checkedMenus   装选中菜单的对象
   * @returns {boolean}                 搜索的菜单中是否有选中的内容
   */
  private getCheckedMenus(searchMenus: Array<any>, checkedMenus: Array<any> = []): boolean {
    // 是否被选中标识符; 标识当前是否被选中和子菜单是否被选中
    let checked = false;
    // 循环搜索
    for (const m of searchMenus) {
      // 检查是否被选中
      if (m.checked === true) {
        checked = true;
      }
      // 检查当前菜单是否子菜单; 有则递归搜索
      if (Utils.referencable(m['children']) && m['children'] instanceof Array) {
        // 如果子菜单有被选中的, 则设置标识符为选中
        if (this.getCheckedMenus(m['children'], checkedMenus)) {
          // checked = true;
        }
      } else {
        // 如果有子子菜单则不作为, 没有且被选中了就放入菜单
        if (checked) {
          checkedMenus.push(m);
        }
      }
    }
    return checked;
  }

  /**
   * 选中或取消选中菜单
   * @param checked                 true或false
   * @param {Array<any>} menus      搜索的菜单
   * @param appliedFor              是否指定菜单, 如果为null则指定所有菜单; 数组是菜单id的集合
   */
  private checkMenusSelector(checked: boolean = false, menus?: Array<any>, appliedFor?: Array<string> | null) {
    // 检查是否存在需要修改的菜单
    let exists = false;
    // 检查参数, 不存在则使用全局
    menus = Utils.referencable(menus) ? menus : this.menus;
    // 循环操作
    for (const m of menus) {
      // 检查是否有指定的菜单
      if (appliedFor === null) {
        exists = true;
      } else {
        // 循环指定的id, 找到匹配的才进行赋值
        for (const a of appliedFor) {
          if (a === m.id) {
            exists = true;
          }
        }
      }
      // 检查其子菜单
      if (Utils.referencable(m['children']) && m['children'] instanceof Array) {
        this.checkMenusSelector(checked, m['children'], appliedFor);
      } else {
        // 没有子菜单则对当前菜单进行, 有子菜单, tree控件会自动处理
        if (exists) {
          m.checked = checked;
        }
      }
    }
  }

  // endregion

  // FIXME 添加角色时无法反选上次选中的菜单

}

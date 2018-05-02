import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../../../../base/services/http/http.service';
import {CommonService} from '../../../../../base/services/common.service';
import {Title} from '@angular/platform-browser';
import {REGEXP, Utils} from '../../../../../base/utils/utils';
import {environment} from '../../../../../../environments/environment';
import {NzMessageService, NzModalService} from 'ng-zorro-antd';
import {fadein, fadeInFromDown2Up} from '../../../../../app.animations';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ComponentBase} from '../../../../../base/component/component.base';
import {Observable} from 'rxjs/Observable';
import {debounceTime, map} from 'rxjs/operators';
import index from '@angular/cli/lib/cli';

@Component({
  selector: 'app-admin-dashboard-sys-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  animations: [
    fadeInFromDown2Up, fadein
  ]
})
export class UserComponent extends ComponentBase implements OnInit, OnDestroy, AfterViewInit {

  private COMPONENT_NAME = 'AdminDashboardUserComponent';

  // 管理员列表
  public list = [];
  // 当前页码
  public currentPage = 1;
  // 每页数量
  public pageRowNum = 30;
  // 所有条数
  public totalRecords = 0;
  // 搜索参数
  public searchForm: FormGroup = new FormGroup({
    username: new FormControl(),
    realname: new FormControl(),
  });
  // 排序参数
  public sort = {
    predicate: '',
    reverse: false
  };


  @ViewChild('tree') tree; // 获取树的结构
  public nodes = [];  // 节点

  // 角色列表
  public roleList = [];

  oldUsername = '';

  // 全选
  _allChecked = false;
  _indeterminate = false;

  // 添加修改Ng对象
  @ViewChild('additBox')
  public additBox;
  @ViewChild('additBoxDept')
  public additBoxDept;
  public treeModal;


  // 添加修改的弹窗对象
  public additModal;
  // 添加修改form
  public additForm: FormGroup;

  constructor(public  http: HttpService,
              public  cs: CommonService,
              private title: Title,
              private msg: NzMessageService,
              private fb: FormBuilder,
              private modal: NzModalService,) {
    // 初始化父类
    super();

    // 设置标题
    this.title.setTitle('管理员管理');

    // 初始化添加修改form
    this.additForm = this.fb.group({
      // id
      id: [null],
      // 账号
      username: [null, [Validators.required, Validators.pattern(/^\S{3,16}$/)], (this.checkUserExists).bind(this)],
      // 姓名
      realname: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
      // 电话
      phone: [null, [Validators.required, Validators.pattern(REGEXP.CHINA_PHONE)]],
      // 角色id集合
      roleIdList: [null,],
      // 部门名称
      deptName: [null,],
      // 部门id
      deptId: [null],

    });
  }

  ngOnInit() {
    this.cs.registerComponent(this.COMPONENT_NAME, this);
    this.loadRoles();

  }

  ngOnDestroy(): void {
    this.cs.unregisterComponent(this.COMPONENT_NAME);
  }

  ngAfterViewInit(): void {
    // 加载列表
    // this.getList();
  }

  /**
   * 获取列表
   * @param {number} curentPage   加载的页码
   */
  public getList(curentPage: number = 1) {
    // 格式化数据
    this.currentPage = Utils.formatPageNum(curentPage, this.currentPage);

    // 请求数据
    this.http.post(environment.modules.admin.http.urls.user.list, {
      curentPage: this.currentPage,
      pageRowNum: this.pageRowNum,
      search: this.searchForm.getRawValue(),
      sort: this.sort,
    }, {notOkMsg: '加载用户列表失败'}).subscribe(
      (res: any) => {
        this.list = res.data.data;
        // 替换角色

        // 循环用户列表
        for (const l of this.list) {
          const roleNames = [];
          l.roleIdList = l.roleIds.split(',');
          // 循环用户角色
          for (const r of l.roleIdList) {
            // 循环角色列表
            for (const rl of this.roleList) {
              if (r === rl.value) {
                roleNames.push(rl.label);
              }
            }
          }
          l.roleNames = roleNames.join(',');
        }


        this.currentPage = res.data['currentPage'];
        this.pageRowNum = res.data['pageSize'];
        this.totalRecords = res.data['totalRecords'];
      }
    );
  }

  /**
   * 显示添加修改弹窗
   * @param title           标题; 默认为"标题"
   * @param {string} data   回填的数据; 存在则是修改, 不存在则是修改
   */
  public showAdditBox(title?: string, data?: any) {

    // 加载组织机构
    this.loadDeptList();

    if (Utils.referencable(data)) {
      this.additForm.patchValue(data);
      // 回显角色
      for (const role of this.roleList) {  // 原始角色列表
        let checked = false;
        for (const ur of data.roleIdList) {  // 用户角色列表
          if (ur === role.value) {
            checked = true;
          }
        }
        role.checked = checked;
      }

    } else {
      this.additForm.reset();

      for (const role of this.roleList) {  // 原始角色列表
        role.checked = false;
      }

    }

    this.additModal = this.modal.open({
      title: title ? title : '标题',
      content: this.additBox,
      maskClosable: false,
      zIndex: 9,
      footer: false,
      style: {
        width: '500px'
      }
    });
  }

  public showAdditBoxDept(title?: string, data?: any) {
    this.treeModal = this.modal.open({
      title: title ? title : '标题',
      content: this.additBoxDept,
      zIndex: 10,
      maskClosable: false,
      footer: false,
      style: {
        width: '300px'
      }
    });
  }


  // 创建或更新用户
  public saveOrUpdate() {
    const user = this.additForm.getRawValue();
    user.roleIdList = [];
    for (const role of this.roleList) {
      if (role.checked) {
        user.roleIdList.push(role.value);
      }
    }

    this.http.post(Utils.hasText(user.id) ? environment.modules.admin.http.urls.user.update :
      environment.modules.admin.http.urls.user.add, user).subscribe((res: any) => {
      this.additModal.destroy();
      // if (Utils.hasText(user.id)) {
      //   for (let i = 0; i < this.list.length; i++) {
      //     if (this.list[i].id === res.data.id) {
      //       this.list.splice(i, 1, res.data);
      //     }
      //   }
      // } else {
      //   this.list.push(res.data);
      // }
      this.getList();
    });

  }


  /**
   * 根据id删除
   * @param {string} id     指定的id
   */
  public del(ids: string) {
    this.http.delete(HttpService.buildUrl(environment.modules.admin.http.urls.user.delete, ids), {
      notOkMsg: '',
      msgSeparator: ''
    }).subscribe((res: any) => {
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


  /**
   *  复选框
   * @param $event
   * @private
   */

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


  // 加载角色列表
  public loadRoles() {
    this.http.post(environment.modules.admin.http.urls.role.select, null).subscribe((res: any) => {
      this.roleList = [];
      for (const role of res.data) {
        this.roleList.push({label: role.roleName, value: role.id});
      }
    });

    // 加载用户列表 loading所有按钮
    this.getList();
  }


  // 验证用户是否存在
  private checkUserExists(control: FormControl): Observable<any> {
    return control.valueChanges.pipe(
      // 延时操作时间, 避免连续使用网络
      debounceTime(500),
      // 查询角色编码是否重复
      map((value) => {
        // 如果this.additTarget.id存在, 则表示是修改; 避免未修改用户名时提示'用户名已存在'
        if (Utils.hasText(this.additForm.controls.id.value)) {
          if (value === this.oldUsername) {
            control.setErrors(null);
            return;
          }
        }
        // 请求网络
        this.http.get(HttpService.buildUrl(environment.modules.admin.http.urls.user.findOne, {username: value})).subscribe(
          (res: any) => {
            if (Utils.referencable(res.data)) {
              // 如果重名则设置对应的参数
              control.setErrors({checked: true, error: true});
            } else {
              control.setErrors(null);
            }    // 检查通过
          }
        );
      })
    );
  }


  // 加载组织机构
  public loadDeptList() {
    this.http.get(environment.modules.admin.http.urls.dept.list).subscribe((res: any) => {
      this.nodes = this.dealWithListToTree('-1', res.data);
    });
  }

  /**
   *
   * @param {string} pid  父级菜单Id
   * @param data //所有数据dept list
   */
  public dealWithListToTree(pid: string, data: Array<any>) {
    const children = [];
    for (let i = 0; i < data.length; i++) {
      const dept = data[i];
      if (dept['parentId'] === pid) {
        // data.splice(i, 1);
        const temp = {name: dept.name, id: dept.id, sort: dept.orderNum, oriData: dept};
        const c = this.dealWithListToTree(dept.id, data);
        if (c.length > 0) {
          temp['children'] = c;
        }
        children.push(temp);
      }
    }

    // 排序
    children.sort((a, b) => {
      return a['sort'] - b['sort'];
    });

    return children;
  }

  // 弹框选中机构
  onActivateDept(ev: any) {
    this.treeModal.destroy();
    this.additForm.controls.deptName.setValue(ev.node.data.oriData.name);
    this.additForm.controls.deptId.setValue(ev.node.data.oriData.id);
  }

  // 重置按钮
  public resetPw(id: String) {
    this.http.post(environment.modules.admin.http.urls.user.resetPw, id).subscribe((res: any) => {
      this.msg.success(`重置密码成功!!!`);
    });

  }

}

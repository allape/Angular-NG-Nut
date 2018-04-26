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

  _allChecked = false;
  _indeterminate = false;

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
      {notOkMsg: '加载用户列表失败'}
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
    const role = this.additForm.getRawValue();

    this.http.post(Utils.hasText(role.id) ? environment.modules.admin.http.urls.role.update : environment.modules.admin.http.urls.role.save, role).subscribe((res: any) => {
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
    if (Utils.referencable(data)) {
      this.additForm.patchValue(data);
    } else {
      this.additForm.reset();
    }
    this.additModal = this.modal.open({
      title: title ? title : '标题',
      content: this.additBox,
      maskClosable: false,
      footer: false,
      style: {
        width: '500px'
      }
    });
  }


  // 删除
  public del(ids?: String) {
    console.log(ids);
    this.http.delete(HttpService.buildUrl(environment.modules.admin.http.urls.role.delete, ids)).subscribe((res: any) => {

        if (res.code !== environment.modules.admin.http.rescodes.ok) {
          this.msg.warning(res.msg);
        }


        for (let i = 0; i < res.data.length; i++) {
          this.delRecursion(res.data[i]);
        }
        this._allChecked = false;
      },
      error2 => {
        this.msg.warning('超级管理员不能删除');
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

}

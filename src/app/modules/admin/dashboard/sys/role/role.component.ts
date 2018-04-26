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
      roleCode: [null, [Validators.required]],
      // 描述
      roleDesc: [null, [Validators.required]]
    });


  }

  ngOnInit() {
    this.getList();
  }


  // 加载列表数据
  public getList(currentPage: number = 1) {
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
    this.http.delete(HttpService.buildUrl(environment.modules.admin.http.urls.role.delete, ids)).subscribe((res: any) => {
      for (let i = 0; i < this.list.length; i++) {
        if (this.list[i].id === ids) {
          this.list.splice(this.list.indexOf(this.list[i]), 1);
        }
      }
    });
  }

  _allChecked = false;
  _indeterminate = false;
  _displayData = [];


  _displayDataChange($event) {
    this._displayData = $event;
    this._refreshStatus();
  }

  _refreshStatus() {
    const allChecked = this._displayData.every(value => value.checked === true);
    const allUnChecked = this._displayData.every(value => !value.checked);
    this._allChecked = allChecked;
    this._indeterminate = (!allChecked) && (!allUnChecked);
  }

  _checkAll(value) {
    if (value) {
      this._displayData.forEach(data => {
        data.checked = true;
      });
    } else {
      this._displayData.forEach(data => {
        data.checked = false;
      });
    }
    this._refreshStatus();
  }

}

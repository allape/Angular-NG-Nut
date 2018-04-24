import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../../../../base/services/http.service';
import {CommonService} from '../../../../../base/services/common.service';
import {Title} from '@angular/platform-browser';
import {REGEXP, Utils} from '../../../../../base/utils/utils';
import {environment} from '../../../../../../environments/environment';
import {NzMessageService, NzModalService} from 'ng-zorro-antd';
import {fadein, fadeInFromDown2Up} from '../../../../../app.animations';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ComponentBase} from '../../../../../base/component/component.base';

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

  // 添加修改Ng对象
  @ViewChild('additBox')
  public additBox;
  // 添加修改的弹窗对象
  public additModal;
  // 添加修改form
  public additForm: FormGroup;

  constructor(
    public  http:       HttpService,
    public  cs:         CommonService,
    private title:      Title,
    private msg:        NzMessageService,
    private fb:         FormBuilder,
    private modal:      NzModalService,
  ) {
    // 设置标题
    this.title.setTitle('管理员管理');

    // 初始化添加修改form
    this.additForm = this.fb.group({
      // id
      id:         [null],
      // 账号
      username:   [null, [Validators.required, Validators.pattern(/^\S{3,16}$/)]],
      // 姓名
      realname:   [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
      // 电话
      phone:      [null, [Validators.required, Validators.pattern(REGEXP.CHINA_PHONE)]]
    });
  }

  ngOnInit() {
    this.cs.registerComponent(this.COMPONENT_NAME, this);
  }

  ngOnDestroy(): void {
    this.cs.unregisterComponent(this.COMPONENT_NAME);
  }

  ngAfterViewInit(): void {
    // 加载列表
    this.getList();
  }

  /**
   * 获取列表
   * @param {number} curentPage   加载的页码
   */
  public getList(curentPage: number = 1) {
    // 格式化数据
    this.currentPage = Utils.formatPageNum(curentPage, this.currentPage);

    // 请求数据
    this.http.post(environment.http.urls.user.list, {
      curentPage:           this.currentPage,
      pageRowNum:           this.pageRowNum,
      search:               this.searchForm.getRawValue(),
      sort:                 this.sort,
    }, {notOkMsg: '加载用户列表失败'}).subscribe(
      (res: any) => {
        this.list =             res.data.data;
        this.currentPage =      res.data['currentPage'];
        this.pageRowNum =       res.data['pageSize'];
        this.totalRecords =     res.data['totalRecords'];
      }
    );
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

  /**
   * 根据id删除
   * @param {string} id     指定的id
   */
  public del(id: string) {
    this.msg.success('删除用户 - ' + id);
  }

}

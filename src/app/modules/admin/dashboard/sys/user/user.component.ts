import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {HttpService} from '../../../../../base/services/http.service';
import {CommonService} from '../../../../../base/services/common.service';
import {Title} from '@angular/platform-browser';
import {Utils} from '../../../../../base/utils/utils';
import {environment} from '../../../../../../environments/environment';
import {NzMessageService} from 'ng-zorro-antd';

@Component({
  selector: 'app-admin-dashboard-sys-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy, AfterViewInit {

  private COMPONENT_NAME = 'AdminDashboardUserComponent';

  // 管理员列表
  public list = [];
  // 当前页码
  public currentPage = 1;
  // 每页数量
  public pageRowNum = 30;
  // 所有条数
  public totalPage = 0;
  // 搜索参数
  public search = {};
  // 排序参数
  public sort = {
    predicate: '',
    reverse: false
  };

  constructor(
    public  http:       HttpService,
    public  cs:         CommonService,
    private title:      Title,
    private msg:        NzMessageService,
  ) {
    title.setTitle('管理员管理');
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
    this.http.post(environment.http.urls.user.search, {
      curentPage:           this.currentPage,
      pageRowNum:           this.pageRowNum,
      search:               this.search,
      sort:                 this.sort,
    }, {notOkMsg: '加载用户列表失败'}).subscribe(
      (res: any) => {
        this.list =             res.data.data;
        this.currentPage =      res.data['currentPage'];
        this.pageRowNum =       res.data['pageSize'];
        this.totalPage =        res.data['totalRecords'];
      }
    );
  }

  /**
   * 根据id删除
   * @param {string} id     指定的id
   */
  public del(id: string) {
    this.msg.success('删除用户 - ' + id);
  }

}

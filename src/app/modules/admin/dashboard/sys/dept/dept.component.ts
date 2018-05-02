import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../../../../base/services/http/http.service';
import {Title} from '@angular/platform-browser';
import {NzMessageService, NzModalService} from 'ng-zorro-antd';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CommonService} from '../../../../../base/services/common.service';
import {environment} from '../../../../../../environments/environment';
import {ComponentBase} from '../../../../../base/component/component.base';
import {Utils} from '../../../../../base/utils/utils';

@Component({
  selector: 'app-admin-dashboard-sys-dept',
  templateUrl: './dept.component.html',
  styleUrls: ['./dept.component.css']
})
export class DeptComponent extends ComponentBase implements OnInit {


  @ViewChild('tree') tree; // 获取树的结构
  public nodes = [];  // 节点

  // 添加修改form
  public additForm: FormGroup;
  // 添加修改Ng对象
  @ViewChild('additBox')
  public additBox;
  // 添加修改的弹窗对象
  public additModal;

  // 展示详情页是否展示
  public isShow = false;


  constructor(public  http: HttpService,
              public  cs: CommonService,
              private title: Title,
              private msg: NzMessageService,
              private fb: FormBuilder,
              private modal: NzModalService) {

    // 初始化父类
    super();
    // 设置标题
    this.title.setTitle('组织机构管理');

// 添加修改form 验证
    this.additForm = this.fb.group({
      // id
      id: [null],
      // 当前组织结构名称
      name: [null, [Validators.required]],
      // 父机构Id
      parentId: [null],
      // 父机构名称
      parentName: [null],
      // 排序号
      orderNum: [null, [Validators.required]],
    });
  }

  ngOnInit() {
    // 页面加载时获取组织机构
    this.loadDeptList();
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


  // 选中显示右侧信息
  onActivate(ev: any) {
    this.additForm.patchValue(ev.node.data.oriData);
    this.isShow = true;
  }

  // 弹框选中
  onActivateUpdate(ev: any) {
    this.additModal.destroy();
    this.additForm.controls.parentName.setValue(ev.node.data.oriData.name);
    this.additForm.controls.parentId.setValue(ev.node.data.oriData.id);

    if (this.additForm.controls.id.value === ev.node.data.oriData.id) {
      this.additForm.controls.parentId.setErrors({checked: true});
    } else {
      this.additForm.controls.parentId.setErrors(null);
    }
  }

  public showAdditBox(title?: string, data?: any) {
    this.additModal = this.modal.open({
      title: title ? title : '标题',
      content: this.additBox,
      maskClosable: false,
      footer: false,
      style: {
        width: '300px'
      }
    });
  }


  // 创建部门 显示右侧回显界面 并清空值
  public createDept() {
    this.isShow = true;
    this.additForm.reset();
  }

  // 更新机构
  public saveOrUpateDept() {
    const dept = this.additForm.getRawValue();
    this.http.post(Utils.hasText(dept.id) ? environment.modules.admin.http.urls.dept.update :
      environment.modules.admin.http.urls.dept.save, dept).subscribe((res: any) => {
      this.isShow = false;
      this.loadDeptList();
    });


  }

  // 删除机构
  delDept() {
    const id = this.additForm.controls['id'].value;
    this.http.delete(HttpService.buildUrl(environment.modules.admin.http.urls.dept.delete, id)).subscribe((res: any) => {
      this.isShow = false;
      this.loadDeptList();
    });

  }
}

import {Directive, ElementRef, Input} from '@angular/core';
import {AdminService} from '../../../admin.service';
import {Utils} from '../../../../../base/utils/utils';

@Directive({
  selector: '[hasPermissions]'
})
export class PermissionDirective {

  @Input('hasPermissions')
  set hasPermissions(permissions: string | Array<string>) {
    setTimeout(() => {
      // 是否授权
      let granted = false;
      // 检查参数
      if (Utils.referencable(permissions)) {
        // 如果为字符串, 则格式化为一个字符串数组
        if (typeof permissions === 'string') {
          // 格式化数据
          permissions = permissions.replace(/\s/gi, '');
          permissions = permissions.split(',');
          permissions = [...permissions, ];
        }
        // 循环检查
        const user = this.as.getUser();
        if (Utils.referencable(user) && user instanceof Array) {
          for (const permission of permissions) {
            if (user['permissions'].includes(permission)) {
              granted = true;
              break;
            }
          }
        }
      }

      if (!granted) {
        this.el.nativeElement.remove();
      }
    });
  }

  constructor(
    private el:       ElementRef,
    private as:       AdminService,
  ) {}

}

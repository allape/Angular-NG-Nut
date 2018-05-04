import {Injectable} from '@angular/core';
import {Utils} from '../../../../../base/utils/utils';


@Injectable()
export class MenuService {

  /**
   * 整理列表菜单至树形菜单
   * @param {Array<any>} list   整理的菜单列表
   * @param topLevelId          顶级菜单的id
   * @param sortName            菜单排序的字段
   * @param childrenName        存放子菜单的键名
   * @returns {null}
   */
  public static formatMenus(
    list: Array<any>,
    topLevelId: string = null,
    sortName: string = 'sort',
    childrenName: string = 'children',
  ): Array<any> {
    // 检查参数
    if (!Utils.referencable(list)) {
      return null;
    }

    // 递归查询的方法
    const formatter = (fm: any, menus: Array<any>) => {
      // 复制一份菜单
      const copiedMenus = menus.slice();
      // 循环查询
      for (let i = 0; i < menus.length; i++) {
        // 跳过null
        if (menus[i] === null) {
          continue;
        }
        // 匹配子菜单
        if (fm.id === menus[i].parentId) {
          // 查询菜单子数组是否存在, 不存在则初始化一个数组
          if (!Utils.referencable(fm[childrenName])) {
            fm[childrenName] = [];
          }
          // 获取子菜单; 并将其设置null, 避免菜单数据依赖循环
          const menu = copiedMenus[i];
          copiedMenus[i] = null;
          // 检查该子菜单是否有子菜单
          formatter(menu, copiedMenus);
          // 将子菜单放入
          fm[childrenName].push(menu);
        }
      }
      // 排序菜单
      if (Utils.referencable(fm[childrenName])) {
        fm[childrenName].sort((a, b) => {
          return a[sortName] - b[sortName];
        });
      }
      return fm;
    };

    // 模拟一个"超顶级"的菜单来装顶级菜单
    return formatter({id: topLevelId}, list)[childrenName];
  }

}

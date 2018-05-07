import {Utils} from './utils';

export class TreeUtils {

  /**
   * 重置选择框
   * @param {Array<any>} tree                   操作的树形结构列表
   * @param {string} childrenFieldName          子菜单字段名称
   * @param {string} fullCheckedFieldName       选中字段名称
   * @param {string} halfCheckedFieldName       半选中字段名称
   */
  public static resetCheckboxes<T>(
    tree: Array<T>,
    childrenFieldName: string = 'children',
    fullCheckedFieldName: string = 'checked',
    halfCheckedFieldName: string = 'halfChecked'
  ) {
    // 循环检查
    for (const m of tree) {
      // 有子菜单则递归处理
      if (Utils.referencable(m[childrenFieldName]) && m[childrenFieldName] instanceof Array) {
        TreeUtils.resetCheckboxes(m[childrenFieldName]);
      }
      // 取消选中
      if (m.hasOwnProperty(fullCheckedFieldName)) {
        delete m[fullCheckedFieldName];
      }
      // 取消半选中
      if (m.hasOwnProperty(halfCheckedFieldName)) {
        delete m[halfCheckedFieldName];
      }
    }
  }

  /**
   * 选中指定的内容
   * @param {Array<T>} tree                     操作的树形结构列表
   * @param {Array<string> | null} appliedFor   搜索匹配的列表; 为null时匹配所有
   * @param {string} appliedFieldName           搜素匹配的字段
   * @param {string} childrenFieldName          子菜单字段名称
   * @param {string} fullCheckedFieldName       选中字段名称
   * @param {string} halfCheckedFieldName       半选中字段名称
   * @returns {number}
   */
  public static checkBoxes<T>(
    tree?: Array<T>,
    appliedFor: Array<string> | null = null,
    appliedFieldName: string = 'id',
    childrenFieldName: string = 'children',
    fullCheckedFieldName: string = 'checked',
    halfCheckedFieldName: string = 'halfChecked',
  ): number {
    // 当前循环的菜单(没有子菜单的)被选中次数
    let checkedCount = 0;
    // 循环操作
    for (const m of tree) {
      // 检查是否存在需要修改的菜单
      let exists = false;

      // 检查是否有指定的菜单
      if (appliedFor === null) {
        exists = true;
      } else {
        // 循环指定的id, 找到匹配的才进行赋值
        for (const a of appliedFor) {
          if (a === m[appliedFieldName]) {
            exists = true;
          }
        }
      }

      // 检查其子菜单
      if (Utils.referencable(m[childrenFieldName]) && m[childrenFieldName] instanceof Array) {
        // 递归检查是否有子菜单被选中
        const hasCheckedChild = TreeUtils.checkBoxes(m[childrenFieldName], appliedFor);
        if (hasCheckedChild === 1) {
          m[halfCheckedFieldName] = true;
          checkedCount += .5;
        } else if (hasCheckedChild === 2) {
          m[fullCheckedFieldName] = true;
          checkedCount++;
        }
      } else {
        // 没有子菜单 && 存在于修改列表中
        if (exists) {
          m[fullCheckedFieldName] = true;
          checkedCount++;
        }
      }

    }

    return checkedCount === 0 ? 0 : (checkedCount === tree.length ? 2 : 1);
  }

  /**
   * 获取选中的元素, 不包括有子菜单的菜单
   * @param {Array<T>} tree                     搜索的树形结构列表
   * @param {Array<T>} checkedItems             保存结果的数组
   * @param {string} childrenFieldName          子菜单字段名称
   * @param {string} checkedFieldName           选中字段名称
   */
  public static getCheckedItems<T>(
    tree: Array<T>,
    checkedItems: Array<T> = [],
    childrenFieldName: string = 'children',
    checkedFieldName: string = 'checked',
  ): Array<T> {
    // 循环搜索
    for (const m of tree) {
      // 检查当前菜单是否子菜单; 有则递归搜索
      if (Utils.referencable(m[childrenFieldName]) && m[childrenFieldName] instanceof Array) {
        TreeUtils.getCheckedItems(m[childrenFieldName], checkedItems);
      } else {
        // 检查是否被选中
        if (m[checkedFieldName] === true) {
          checkedItems.push(m);
        }
      }
    }
    return checkedItems;
  }

}

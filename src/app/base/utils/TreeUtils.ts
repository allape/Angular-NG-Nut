import {Utils} from './utils';

/**
 * 树形工具类
 * @author AllenSnape
 */
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
   * 获取选中的元素, 如果某菜单的子菜单有一个被选中, 则它也会被选中
   * @param {Array<T>} tree                     搜索的树形结构列表
   * @param {Array<T>} checkedItems             保存结果的数组
   * @param {string} childrenFieldName          子菜单字段名称
   * @param {string} checkedFieldName           选中字段名称
   * @return {boolean}                          是否被选中
   */
  public static getCheckedItems<T>(
    tree: Array<T>,
    checkedItems: Array<T> = [],
    childrenFieldName: string = 'children',
    checkedFieldName: string = 'checked',
  ): boolean {
    // 是否被选中
    let checked = false;
    // 循环搜索
    for (const m of tree) {
      // 当前检查的菜单是否被选中, 或其子菜单是否有被选中的
      let mChecked = m[checkedFieldName];

      // 检查当前菜单是否子菜单; 有则递归搜索
      if (Utils.referencable(m[childrenFieldName]) && m[childrenFieldName] instanceof Array) {
        if (TreeUtils.getCheckedItems(m[childrenFieldName], checkedItems) === true) {
          mChecked = true;
        }
      }

      // 如果有被选中的, 则设置为选中
      if (mChecked) {
        checkedItems.push(m);
        checked = true;
      }
    }
    return checked;
  }

  /**
   * 整理列表数据至树形数据
   * @param {Array<any>} list         整理的列表
   * @param topLevelId                树根的id
   * @param sortFieldName             排序的字段名称
   * @param idFieldName               id字段名称
   * @param parentIdFieldName         父id字段名称
   * @param childrenFieldName         存放子数据的字段名称
   * @returns {null}
   */
  public static list2Tree<T>(
    list: Array<T>,
    topLevelId: string = null,
    sortFieldName: string = 'sort',
    idFieldName: string = 'id',
    parentIdFieldName: string = 'parentId',
    childrenFieldName: string = 'children',
  ): Array<T> {

    // 检查参数
    if (!Utils.referencable(list)) {
      return null;
    }

    // 递归查询的方法
    const formatter = (f: any, l: Array<any>) => {
      // 复制一份菜单
      const copiedList = l.slice();
      // 循环查询
      for (let i = 0; i < l.length; i++) {
        // 跳过null
        if (l[i] === null) {
          continue;
        }
        // 匹配子菜单
        if (f[idFieldName] === l[i][parentIdFieldName]) {
          // 查询菜单子数组是否存在, 不存在则初始化一个数组
          if (!Utils.referencable(f[childrenFieldName])) {
            f[childrenFieldName] = [];
          }
          // 获取子菜单; 并将其设置null, 避免菜单数据依赖循环
          const item = copiedList[i];
          copiedList[i] = null;
          // 检查该子菜单是否有子菜单
          formatter(item, copiedList);
          // 将子菜单放入
          f[childrenFieldName].push(item);
        }
      }
      // 排序菜单
      if (Utils.referencable(f[childrenFieldName])) {
        f[childrenFieldName].sort((a, b) => {
          return a[sortFieldName] - b[sortFieldName];
        });
      }
      return f;
    };

    // 模拟一个"超顶级"的菜单来装顶级菜单
    const root = {};
    root[idFieldName] = topLevelId;
    root[childrenFieldName] = [];
    return formatter(root, list)[childrenFieldName];
  }

}

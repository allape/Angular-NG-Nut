/**
 * 静态工具类
 */
export class Utils {

  /**
   * 检查字符串是否包含内容
   * @param {string | any} s
   * @returns {boolean}
   */
  public static hasText(s: any): boolean {
    return s === undefined ? false : (
      typeof s === 'string' ?
        /^[\S]+$/gi.test(s === null ? '' : s.replace(/\s/gi, '')) :
        Utils.hasText(s.toString())
    );
  }

  /**
   * 检查字符串或数组是否有长度
   * @param s
   * @returns {boolean}
   */
  public static hasLength(s: any): boolean {
    return s === undefined ? false : (
      typeof s === 'string' ?
      (s === null ? false : (s.length > 0)) :
      (s instanceof Array ? (s === null ? false : (s.length > 0)) : Utils.hasLength(s.toString()))
    );
  }

  /**
   * 检查对象是否可以被引用, 即剔除null和undefined
   * @param obj           检查的对象
   * @returns {boolean}   true: 可以引用; false: 不可引用
   */
  public static referencable(obj: any): boolean {
    return obj === null || obj === undefined ? false : true;
  }

}

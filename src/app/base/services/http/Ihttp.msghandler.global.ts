/**
 * HTTP请求服务的全局消息预处理信息对象
 */
export interface IHttpMsgHandlerGlobal {

  /**
   * 响应编号在首级JSON中的名称 --> 例如: {"code": -1, "msg": "处理失败!"}
   */
  codeName?: string;

  /**
   * 响应消息在首级JSON中的名称 --> 如上
   * @type {string}
   */
  msgName?: string;

  /**
   * 正常时候的编号, 不是这个的时候会提示消息
   * @type {number}
   */
  okCode?: any;

  /**
   * 非正常的时候提示的消息
   * @type {string}
   */
  notOkMsg?: string | null;

  /**
   * 是否显示错误信息
   */
  showNotOkMsg?: any;

  /**
   * 提示级别
   * @type {string}
   */
  msgLevel?: string;

  /**
   * 是否显示响应的消息字段
   * @type {boolean}
   */
  showWithMsg?: boolean;

  /**
   * 拼接响应消息的符号
   * @type {string}
   */
  msgSeparator?: string;

  /**
   * 是否仅响应状态为ok的; 有且仅有false时才在任意状态响应
   */
  okResponse?: any;

  /**
   * 格式化传入的信息, 存对应的配置则使用传入的, 没有就使用默认的值
   * @param {IHttpMsgHandlerGlobal} mh
   */
  format(mh: IHttpMsgHandlerGlobal): IHttpMsgHandlerGlobal;

}

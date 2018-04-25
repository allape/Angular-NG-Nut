/**
 * HTTP请求服务的全局消息预处理信息对象
 */
import {IHttpMsgHandlerGlobal} from './Ihttp.msghandler.global';
import {Utils} from '../../utils/utils';

export class HttpMsgHandlerGlobal implements IHttpMsgHandlerGlobal {

  public codeName =           'code';
  public msgName =            'msg';
  public okCode =              1;
  public defaultNotOkMsg =    '数据加载失败!';
  public msgLevel =           'warning';
  public showWithMsg =        true;
  public msgSeparator =       ', ';

  /**
   * 格式化传入的信息, 存对应的配置则使用传入的, 没有就使用默认的值
   * @param {IHttpMsgHandlerGlobal} mh
   */
  public format(mh: IHttpMsgHandlerGlobal) {
    const handler = new HttpMsgHandlerGlobal();
    for (const k in mh) {
      if (Utils.referencable(mh[k])) {
        handler[k] = mh[k];
      } else {
        handler[k] = this[k];
      }
    }
  }

}

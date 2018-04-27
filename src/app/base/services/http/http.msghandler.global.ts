import {IHttpMsgHandlerGlobal} from './Ihttp.msghandler.global';
import {Utils} from '../../utils/utils';

export class HttpMsgHandlerGlobal implements IHttpMsgHandlerGlobal {

  public codeName =           'code';
  public msgName =            'msg';
  public okCode =              1;
  public notOkMsg =           '数据加载失败!';
  public showNotOkMsg =       true;
  public msgLevel =           'warning';
  public showWithMsg =        true;
  public msgSeparator =       ', ';
  public okResponse =         true;

  public format(mh: IHttpMsgHandlerGlobal): IHttpMsgHandlerGlobal {
    const handler = {};
    for (const k in this) {
      if (Utils.referencable(mh[k])) {
        handler[k] = mh[k];
      } else {
        handler[k] = this[k];
      }
    }
    return handler;
  }

}

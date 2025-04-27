import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { isInApp, isMobile, isObject, isFunction, urlAllParams, loadMiniProgramSDK, historyPush } from '../utils/tools';
import template from '../template';
import { IWidgetData, TPath } from '../render';
import { IFormRef, TNameMap, IOptions } from '../render/types';
import fetchAPI, { getFetchResult } from '../utils/fetchAPI';
import { Toast, Modal, Loading } from '../components';
import ActionConfig from './index';
import { UrlProps } from '../types';

let root: any = {};

if (typeof window !== 'undefined') {
  root = window;
}

// declare var window: WindowProps;

export interface ActionProps {
  type: string;
  data?: any;
}

export type TActionsProps = ActionProps | ActionProps[]

export interface FetchProps {
  url: string;
  method?: any;
  // 兼容旧版本
  type?: string;
  data?: any;
  needFormData?: boolean;
  isLoading?: boolean;
  toastMessage?: boolean;
  isUrlParam?: boolean;
  onLog?: (props: any, value?: any) => void;
}

type ActionCallabck = (data?: any) => void | undefined;


interface IActionOption {
  actions?: typeof ActionConfig;
  formData?: object;
  nameMap?: TNameMap;
  callback?: () => void;
  globleData?: object;
  parent?: IWidgetData;
  options?: IOptions<any>;
  form?: IFormRef;
  result?: object;
  paths?: TPath;
  update?: () => void;
}

/**
 * 跳转链接
 * @param  {string|object} url               链接地址、数据{ url: '' }
 * @config {string}        url               链接
 * @config {string}        mode              跳转方式，默认：history，可选：href
 * @config {boolean}       isMiniprogramUrl  是否小程序链接，
 * @param  {function}  cb   回调
 */
export const goUrl = (url: any, options: { callback?: ActionCallabck } = {}) => {
  const { callback } = options;

  if (!url) {
    console.error('action url');
    return false;
  }

  let mode = 'history';
  let isMiniprogramUrl = false;

  if (callback && isFunction(callback)) {
    callback(url);
  }

  if (isObject(url)) {
    ({ url, mode = 'history', isMiniprogramUrl = false } = url);
  }

  // 小程序 webview
  // load SDK 防止页面未引入script
  if (isMiniprogramUrl && root.__wxjs_environment === 'miniprogram') {
    loadMiniProgramSDK(() => {
      root.wx.miniProgram.navigateTo({
        url,
      });
    });
  } else if (mode && mode === 'history') {
    // ios JSBridge.go 打开新webview 下一个页面 localstorage带不过去
    historyPush(url);
  } else {
    window.location.href = url;
  }
};

/**
 * 跳转链接，带当前参数一起带下一个页面
 * @param  {string|object} url  链接地址、数据{ url: '' }
 * @config {string}        url  链接
 * @config {string}        mode       跳转方式，默认：history，可选：href
 * @param  {string} locUrl 取值链接，未传直接回调
 * @param  {function}  cb   回调
 */
export const goUrlParam = (url: any, options: { locUrl?: any; callback?: ActionCallabck } = {}) => {
  const { locUrl, callback } = options;

  if (!url) {
    console.error('action url param');
    return false;
  }

  let mode = 'history';
  let isMiniprogramUrl = false;

  // 回调
  if (isFunction(locUrl)) {
    locUrl(url);
  } else if (callback && isFunction(callback)) {
    callback(url);
  }

  if (isObject(url)) {
    ({ url, mode = 'history', isMiniprogramUrl = false } = url);
  }

  const tempUrl = typeof locUrl === 'string' ? locUrl : root.location.href;

  const urlParams = urlAllParams(tempUrl);
  const addParams: string[] = [];
  let reg: any;

  Object.keys(urlParams).map((key) => {
    reg = new RegExp(`${key}=`);

    // 去重复参数
    if (!reg.test(url)) {
      addParams.push(`${key}=${encodeURIComponent((urlParams[key] as string))}`);
    }

    return key;
  });

  url += /\?/.test(url) ? '&' : '?';
  url += addParams.join('&');

  // 小程序 webview
  // load SDK 防止页面未引入script
  if (isMiniprogramUrl && root.__wxjs_environment === 'miniprogram') {
    loadMiniProgramSDK(() => {
      root.wx.miniProgram.navigateTo({
        url,
      });
    });
  } else if (mode && mode === 'history') {
    historyPush(url);
  } else {
    window.location.href = url;
  }
};

/**
 * 小程序内嵌H5(webview)，返回小程序
 * @param  {object}   data    数据
 * @config {string}   url     跳转路径
 * @config {string}   type    返回小程序
 * @param  {function} cb      回调
 */
export const miniWebview = (data: UrlProps, options: { callback?: ActionCallabck } = {}) => {
  const { callback } = options;

  if (!isObject(data)) {
    return false;
  }

  if (callback && isFunction(callback)) {
    callback(data);
  }

  const { url, type } = data;

  // 小程序 webview
  // load SDK 防止页面未引入script
  if (root.__wxjs_environment === 'miniprogram') {
    loadMiniProgramSDK(() => {
      switch (type) {
        case 'reLaunch':
          root.wx.miniProgram.reLaunch({
            url,
          });
          break;
        case 'switchTab':
          root.wx.miniProgram.switchTab({
            url,
          });
          break;
        default:
          root.wx.miniProgram.navigateTo({
            url,
          });
          break;
      }
    });
  }
};

/**
 * 跳转form
 * @param  {object}  data    数据
 * @config {string}  method  发送类型
 * @config {string}  url     发送链接
 * @config {object}  params  参数
 * @config {string}  acceptCharset  字符编码
 * @param  {function} cb      回调
 */
export const goFormUrl = (data: UrlProps, options: { callback?: ActionCallabck }) => {
  const { callback } = options;

  if (callback && isFunction(callback)) {
    callback(data);
  }

  const { method = 'get', url, params, acceptCharset } = data;

  if (method && method.toUpperCase() === 'GET') {
    root.location.href = url;
  } else {
    const form = document.createElement('form');
    form.action = url;
    form.method = method;
    form.id = `go_url_${Math.random()}`;

    // 跳转保司gbk编码
    if (acceptCharset) {
      form.acceptCharset = acceptCharset;
    }

    document.body.appendChild(form);

    if (params) {
      Object.keys(params).forEach((key: string) => {
        const input = document.createElement('input');

        input.type = 'hidden';
        input.name = key;
        input.value = params[key];
        form.appendChild(input);
      });
    }

    form.submit();
  }
};

/**
 * 刷新页面
 * @param  {function} cb   回调
 */
export const reload = (data: never, options: { callback?: ActionCallabck } = {}) => {
  const { callback } = options;

  if (callback && isFunction(callback)) {
    callback();
  }

  if (root.history) {
    root.history.go(0);
  } else {
    root.location.reload();
  }
};

/**
 * 返回上一个页面
 * @param  {function} cb   回调
 */
export const goBack = (data: never, options: { callback?: ActionCallabck } = {}) => {
  const { callback } = options;

  if (callback && isFunction(callback)) {
    callback();
  }

  // 在webview跳转
  if (root.history && root.history.length > 1) {
    root.history.go(-1);
  } else {
    // JSBridge.ready(() => {
    //   JSBridge.goBack();
    // });
  };
};

/**
 * 下载
 * @param  {object}   data 数据
 * @config {string}   url  链接
 * @config {string}   name 窗口打开状态，默认_blank
 * @param  {function} cb   回调
 */
export const download = (data: UrlProps, options: { callback?: ActionCallabck } = {}) => {
  const { callback } = options;

  if (!data) {
    console.error('action download params');
    return Promise.reject(Error('action download params'));
  }

  if (callback && isFunction(callback)) {
    callback(data);
  }

  root.open(data.url, data.name || '_blank');

  return Promise.resolve();
};

/**
 * 弱提示
 * @param  {string||object} message 数据
 * @config {string}   message       提示文案
 * @config {number}   duration      自动隐藏时间，默认3000
 * @param  {boolean}  mask          是否展示遮罩层，默认true
 * @param  {function} afterClose    关闭回调
 */
export const toast = (data: any, options: { duration?: number; afterClose?: ActionCallabck } = {}) => {
  if (!data) {
    console.error('action toast');
    return Promise.reject(Error('action toast'));
  }

  const { afterClose } = options;
  let { duration } = options
  const cb: any = isFunction(duration) ? duration : afterClose;
  let message = data;
  let mask = true;

  if (isObject(data)) {
    ({ message } = data);

    // 自动隐藏时间
    if (data.duration) {
      ({ duration } = data);
    }

    // 是否显示遮罩层，不影响用户操作。默认true
    if (typeof data.mask !== 'undefined') {
      ({ mask } = data);
    }

    // 兼容个险历史动作规则，新接入禁止使用
    if (data.value && !message) {
      message = data.value;
    }
  }

  if (document.getElementById('actionToast')) {
    return Promise.reject(Error('重复'));;
  }

  const div = document.createElement('div');
  div.id = 'actionToast';
  document.body.appendChild(div);

  const onClose = () => {
    if (cb && isFunction(cb)) {
      cb(data);
    }

    ReactDOM.unmountComponentAtNode(div);
    document.body.removeChild(div);
  };

  return new Promise((resolve) => {
    ReactDOM.render(
      <Toast
        visible
        mask={mask}
        stayTime={typeof duration === 'number' ? duration : 3000}
        afterClose={() => {
          resolve({});
          onClose();
        }}
      >
        {message}
      </Toast>,
      div,
    );
  });
};

/**
 * 数据格式和toast一致 长文案后端会通过modal形式提示
 * @param data
 * @param cb
 * @returns
 */
export const toastModal = (data: any, cb?: ActionCallabck) => {
  if (!data) {
    console.error('action toast modal');
    return false;
  }

  if (document.getElementById('actionToastModal')) {
    return false;
  }

  let message = data;
  let title = '';
  let label = '';

  if (isObject(data)) {
    ({ message, title, label } = data);

    // 兼容个险历史动作规则，新接入禁止使用
    if (data.value && !message) {
      message = data.value;
    }
  }

  const div = document.createElement('div');
  div.id = 'actionToastModal';
  document.body.appendChild(div);

  const onClose = () => {
    if (cb && isFunction(cb)) {
      cb(data);
    }

    ReactDOM.unmountComponentAtNode(div);
    document.body.removeChild(div);
  };
  const prefixCls = 'cre-modal';

  const modelCls = ((isMobile || isInApp) ? `${prefixCls}-mobile` : `${prefixCls}-web`);
  const width = ((isMobile || isInApp) ? '80%' : '880px');
  const cls = classnames(prefixCls, modelCls);

  ReactDOM.render((
    <Modal
      visible
      className={cls}
      width={width}
      onMaskClick={onClose}
    >
      {title && (
        <Modal.Header
          title={title}
          onClose={() => onClose()}
        />
      )}
      <Modal.Body>
        <div className={`${prefixCls}-body modal-toast-body-center`}>{message}</div>
      </Modal.Body>
      <Modal.Footer>
        <button
          className={`${prefixCls}-button modal-toast-button-color`}
          onClick={onClose}
        >
          {label || '我知道了'}
        </button>
      </Modal.Footer>
    </Modal>
  ), div);
};

export interface CopyProps {
  text: string;
}

/**
 * 复制文本
 * @param  {object}   data    复制数据
 * @config {string}   text    文本
 * @param  {function} cb      回调
 */
export const copy = (data: CopyProps, options: IActionOption & { callback?: ActionCallabck } = {}) => {
  const { callback, result, actions = ActionConfig } = options;

  if (callback && isFunction(callback)) {
    callback(data);
  }

  const { text } = { ...data, ...result };

  if (typeof text !== 'string') {
    console.error('请传入字符串');
    return false;
  }

  try {
    const div = document.createElement('div');

    div.innerHTML = text;
    document.body.appendChild(div);

    root.getSelection().removeAllRanges();

    const range = document.createRange();
    range.selectNode(div);
    root.getSelection().addRange(range);

    const success = document.execCommand('copy');

    if (success) {
      actions.toast('复制成功');
    } else {
      actions.toast('复制失败');
    }

    root.getSelection().removeAllRanges();
    document.body.removeChild(div);

    return Promise.resolve(text);
  } catch (error) {
    console.error(error);
  }

  return Promise.reject(Error('copy错误'));
};

export interface ModelProps {
  label?: string;
  type?: 'inline' | 'line';
  widget?: 'text-model-line';
  className?: string;
  closable?: boolean;
  options: any[];
  footer?: any[];
  buttons?: any[];
  log?: string;
  onLog?: (props: any, value?: any) => void;
}

/**
 * 弹层
 * @param  {object}   data    数据
 * @config {string}   label   标题
 * @config {object[]} options 内容
 * @config {object[]} footer  底部
 * @param  {function} cb   回调
 */
export const model = (data: ModelProps, mOptions: { callback?: ActionCallabck } = {}) => {
  if (document.getElementById('actionModel')) {
    return false;
  }

  const { callback } = mOptions;
  const div = document.createElement('div');
  div.id = 'actionModel';
  document.body.appendChild(div);

  const prefixCls = 'cre-modal';
  // type=line
  const { label, options, footer, buttons, closable, className, widget, log, onLog } = data;
  let { type } = data;
  // type=line
  // 兼容旧动作
  if (widget && widget === 'text-model-line') {
    type = 'line';
  }

  // 打开弹框埋点
  if (isFunction(onLog) && log) {
    onLog && onLog(log);
  }

  const modelCls = ((isMobile || isInApp) ? `${prefixCls}-mobile` : `${prefixCls}-web`);
  const width = ((isMobile || isInApp) ? '80%' : '880px');
  const cls = classnames(prefixCls, modelCls, {
    [`${prefixCls}-${type}`]: !!type,
  }, className);

  // 关闭弹层
  const onClose = () => {
    if (callback && isFunction(callback)) {
      callback(data);
    }

    ReactDOM.unmountComponentAtNode(div);
    document.body.removeChild(div);
  };

  const onButton = (action: any, resolve: any, reject: any) => {
    if (action && action.action) {
      ({ action } = action);
    }

    if (!(action && action.type)) {
      return false;
    }

    const { log: acLog } = action || {};

    // 点击弹框按钮的埋点
    if (acLog && isFunction(onLog)) {
      onLog && onLog(acLog);
    }

    if (action.type === 'cancel') {
      onClose();
      reject(Error('取消'));
      return false;
    }

    if (ActionConfig[action.type]) {
      onClose();
      resolve({});
      ActionConfig[action.type]?.(action.data);
    }
  };

  const renderOptions = (item: any) => {
    const { type: itemtype, href, alt, label: itemlabel, value, copyText } = item;

    if (!itemtype) {
      return typeof item.label !== 'undefined' ? template(itemlabel) : value;
    }

    switch (itemtype) {
      case 'image':
        return <img src={href} alt={alt || ''} />;
      case 'copy':
        return (
          <>
            <span>{template(itemlabel)}</span>
            <span className="model-copy-btn" onClick={() => copy({ text: copyText })}>
              复制
            </span>
          </>
        );
      default:
        break;
    }
  };

  // 兼容老版本
  const footers = footer || buttons || [];

  return new Promise((resolve, reject) => {
    ReactDOM.render(
      <Modal
        visible
        className={cls}
        width={width}
        onMaskClick={() => {
          reject(Error('取消'));
          onClose();
        }}
      >
        <Modal.Header
          title={label}
          closable={closable}
          onClose={() => {
            reject(Error('取消'));
            onClose();
          }}
        />
        <Modal.Body>
          {
            Array.isArray(options) && options.length
              ? options.map((item, index) => (
                <div className={classnames(`${prefixCls}-item`, { [`${prefixCls}-item-${item.type}`]: !!item.type })} key={`item_${index}`} style={item.style}>
                  {renderOptions(item)}
                </div>
              ))
              : null
          }
        </Modal.Body>
        <Modal.Footer>
          {
            Array.isArray(footers) && footers.length
              ? footers.map((item, index) => (
                <button
                  className={`${prefixCls}-button`}
                  key={`item_${index}`}
                  onClick={() => {
                    onButton(item, resolve, reject)
                  }}
                  style={item.style}
                >
                  {item.label}
                </button>
              ))
              : null
          }
        </Modal.Footer>
      </Modal>,
      div,
    )
  });
};

/**
 * 警告框
 * @param  {object}   data    数据
 * @config {string}   label   标题
 * @config {array<{ label: string }>} options 内容
 * @config {array<{ label: string }>} footer  底部
 * @param  {function} cb   回调
 */
export const alert = (data: ModelProps, aOptions: { callback?: ActionCallabck } = {}) => {
  if (document.getElementById('actionAlert')) {
    return false;
  }

  const { callback } = aOptions;
  const div = document.createElement('div');
  div.id = 'actionAlert';
  document.body.appendChild(div);

  const prefixCls = 'cre-alert';
  const { label, options, className } = data;
  const modelCls = isMobile ? `${prefixCls}-mobile` : `${prefixCls}-web`;
  const width = isMobile ? '80%' : '880px';
  let { footer } = data;

  // 关闭弹层
  const onClose = () => {
    if (callback && isFunction(callback)) {
      callback(data);
    }

    ReactDOM.unmountComponentAtNode(div);
    document.body.removeChild(div);
  };

  if (typeof footer === 'undefined') {
    footer = [
      {
        label: '知道了',
        action: {
          type: 'cancel',
        },
      },
    ];
  }

  const onButton = (action: any, resolve: any, reject: any) => {
    if (!(action && action.type)) {
      return;
    }

    if (action.type === 'cancel') {
      reject(Error('取消'));
      onClose();
      return;
    }

    if (ActionConfig[action.type]) {
      onClose();
      resolve({});
      ActionConfig[action.type]?.(action.data);
    }
  };

  return new Promise((resolve, reject) => {
    ReactDOM.render(
      <Modal
        visible
        className={classnames(prefixCls, modelCls, className)}
        width={width}
        onMaskClick={() => {
          reject(Error('取消'));
          onClose()
        }}
      >
        <Modal.Header title={label} />
        <Modal.Body>
          {
            Array.isArray(options) && options.length
              ? options.map((item, index) => (
                <div className={`${prefixCls}-item`} key={`item_${index}`}>
                  {item.label}
                </div>
              ))
              : null
          }
        </Modal.Body>
        <Modal.Footer>
          {
            Array.isArray(footer) && footer.length
              ? footer.map((item, index) => (
                <button
                  className={`${prefixCls}-button`}
                  key={`item_${index}`}
                  onClick={() => {
                    onButton(item.action, resolve, reject)
                  }}
                >
                  {item.label}
                </button>
              ))
              : null
          }
        </Modal.Footer>
      </Modal>,
      div,
    );
  });
};

/**
 * 提示层
 * @param {string}    content  内容模块
 * @param {string}    label    标题
 * @param  {function} cb       回调
 */
export const tips = (data: { content: React.ReactNode; label: string }, options: any) => {
  const { result, callback } = options;
  const assignData = { ...result, ...data };
  const { content = '', label = '' } = assignData;

  if (document.getElementById('actionTips')) {
    return Promise.reject();
  }

  const div = document.createElement('div');
  div.id = 'actionTips';
  document.body.appendChild(div);

  const prefixCls = 'cre-alert';

  const modelCls = ((isMobile || isInApp) ? `${prefixCls}-mobile` : `${prefixCls}-web`);
  const width = ((isMobile || isInApp) ? '80%' : '880px');

  // 关闭弹层
  const onClose = () => {
    if (callback && isFunction(callback)) {
      callback(content);
    }

    ReactDOM.unmountComponentAtNode(div);
    document.body.removeChild(div);
  };

  return new Promise((resolve) => {
    ReactDOM.render(
      <Modal
        visible
        className={`${prefixCls} ${modelCls}`}
        width={width}
        onMaskClick={() => {
          resolve({});
          onClose()
        }}
      >
        <Modal.Header
          title={label}
          closable
          onClose={() => {
            resolve({});
            onClose()
          }}
        />
        <Modal.Body>{content}</Modal.Body>
      </Modal>,
      div,
    );
  });
};

/**
 * 接口获取数据
 * @param  {object}   fetch        接口参数
 * @config {string}   url          链接
 * @config {string}   method       请求类型
 * @config {string}   data         请求参数
 * @config {boolean}  isLoading    请求状态
 * @config {boolean}  toastMessage 提示信息
 * @config {boolean}  isUrlParam   是否携带链接参数
 * @param  {object}   params       附加参数
 * @param  {function} cb           回调
 */
export const fetchInterface = (fetch: FetchProps, options: any) => {
  const { params = {}, formData, actions = ActionConfig, callback, result } = options || {};
  const { url = '', method, needFormData, data = {}, isLoading = false, toastMessage = true, isUrlParam = false } = fetch || {};

  if (isLoading) {
    Loading.show();
  }

  const urlParams = isUrlParam ? urlAllParams(root.location.href) : {};

  return fetchAPI.fetch({
    path: url,
    method,
    data: {
      ...result,
      ...urlParams,
      ...data,
      ...params,
      ...(needFormData ? formData : {}),
    },
  }).finally(() => {
    if (isLoading) {
      Loading.hide();
    }
  }).then((response: any) => {
    if (callback && isFunction(callback)) {
      callback(response);
    }

    if (!response) {
      actions.toast('返回数据异常');
      return Promise.reject(Error('返回数据异常'));
    }

    if (+response.code === 0 || response.result === 'success') {
      const newResult = getFetchResult(response);

      if (newResult && newResult.type && actions[newResult.type]) {
        actions[newResult.type](newResult.data);
      }

      return Promise.resolve(newResult);
    }

    if (toastMessage && (response.message || response.reason)) {
      actions.toast(response.message || response.reason);

      return Promise.reject(response.message || response.reason);
    }
  });
};

export interface ShareProps {
  title: string;
  desc: string;
  imgUrl: string;
  link?: string;
}

/**
 * 调起分享，App内调起分享，浏览器跳转链接
 * @param {object}   data     分享数据
 * @config {string}  title    分享标题
 * @config {string}  desc     分享摘要
 * @config {string}  imgUrl   分享图片
 * @config {string}  link     分享链接
 * @param  {function} cb        回调
 */
export const share = (data: ShareProps, options: IActionOption & { result: any, callback?: ActionCallabck }) => {
  const { callback, actions = ActionConfig } = options;

  if (callback && isFunction(callback)) {
    callback(data);
  }

  if (isInApp) {
    data = {
      link: window.location.href,
      ...data,
    };

    // JSBridge.ready(() => {
    //   JSBridge.share(data);
    // });
  } else if (data && data.link) {
    window.location.href = data.link;
  } else {
    actions.toast('分享失败');
  }
};

export default {
  // 跳转链接
  url: goUrl,
  // 跳转URL,带当前链接参数
  urlParam: goUrlParam,
  // 兼容旧版本。跳转URL,带当前链接参数
  'url-param': goUrlParam,
  // 小程序内嵌H5(webview)，返回小程序
  webview: miniWebview,
  // 用form方式跳转
  form: goFormUrl,
  // 接口请求数据
  fetch: fetchInterface,
  // 兼容旧接口请求
  ajax: fetchInterface,
  // 刷新当前页面
  reload,
  // 返回上一页
  back: goBack,
  // 模版下载
  download,
  // 弱提示
  toast,
  // 强提示，数据结构同toast
  'toast-modal': toastModal,
  // 弹层
  model,
  // 警告框
  alert,
  // 调起分享
  share,
  // 复制文本
  copy,
  tips,
};

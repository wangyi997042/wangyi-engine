import cloneDeep from 'lodash.clonedeep';
import _set from 'lodash.set';
import { TPath } from '../render';
import {
  WindowProps,
  ObjectProps,
} from '../types';

declare let window: WindowProps;

let root: any = {};

if (typeof window !== 'undefined') {
  root = window;
}

const UA = (typeof window === 'undefined') ? '' : root.navigator.userAgent.toLowerCase();

// 移动端
export const isMobile = /android|iphone|iPad|ipod|windows\sphone/.test(UA);

export const isIOS = /iPhone|iPad|iPod/i.test(UA);
// App内
export const isInApp = false;
// 是否为window系统
export const isWindows = /windows|win32/.test(UA);
// 微信
export const isInWechat = !!~UA.indexOf('micromessenger');

/**
 * 对象检测
 * @param value
 */
export const isObject = (value: any): value is ObjectProps => {
  return Reflect.toString.call(value) === '[object Object]';
};

/**
 * 函数检测
 * @param func
 */
export const isFunction = (func: any): func is ((...arg: any) => any) => {
  return typeof func === 'function';
};

export const setValue = (obj: object, names: TPath, value: any) => {
  _set(obj, names, value);
};

/**
 * 深复制
 * @param {array|object} data 数据
 */
export const deepCopy = (data: any) => {
  return cloneDeep(data);
};

export const promiseContral = () => {
  let dresolve: (value?: unknown) => void = () => undefined;
  let dreject: (value?: unknown) => void = () => undefined;
  const promiseobj = new Promise((resolve, reject) => {
    dresolve = resolve;
    dreject = reject;
  });

  return {
    promiseobj,
    resolve: dresolve,
    reject: dreject,
  };
};

/**
 * 获取URL全部参数
 * @param  {string} url  链接地址
 * @return {object}      返回参数值
 */
export const urlAllParams = (url?: string) => {
  if (!url) {
    url = window.location.href;
  }

  // Regex for replacing addition symbol with a space
  const pl = /\+/g;
  const urlParams: { [key: string]: string } = {};
  const decode = (s: string) => decodeURIComponent(s.replace(pl, ' '));

  url = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, (_m: string, key: string, value: string): any => {
    urlParams[decode(key)] = decode(value);
  });

  return urlParams;
};

/**
 * 生成随机串
 */
export const uuid = (len = 32) => {
  /** **默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1*** */
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  const maxPos = $chars.length;
  let pwd = '';
  for (let i = 0; i < len; i += 1) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
};

export const addUuidToObj = (item: any) => {
  if (isObject(item)) {
    if (!item.uuid) {
      item.uuid = uuid();
    }

    return item;
  }

  return { uuid: uuid() };
};

/**
 * 首字母转换大写
 * @param {string} str  内容
 */
export const firstUpperCase = (str: string) => {
  if (typeof str !== 'string') {
    return '';
  }
  return str.replace(/^\S/g, (s) => s.toUpperCase());
};

export function arrayHasChild(arr: any): arr is [] {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * 首字母转换大写
 * @param {string} str  内容
 */
export const lineToHump = (str: string) => {
  if (typeof str !== 'string') {
    return '';
  }

  return str.split('-').map((strItem) => firstUpperCase(strItem)).join('');
};

/**
 * 加载小程序SDK
 * @param {function} cb  回调
 */
export const loadMiniProgramSDK = (cb: () => void) => {
  if (typeof root.wx === 'undefined') {
    const script = document.createElement('script');
    const head = document.getElementsByTagName('head')[0];

    script.src = 'https://res.wx.qq.com/open/js/jweixin-1.3.2.js';

    script.onload = () => {
      script.onload = null;
      cb && cb();
    };

    head.appendChild(script);
  } else {
    cb && cb();
  }
};

/**
 * 页面无刷新跳转链接
 * @param {string}  url   跳转地址
 */
export const historyPush = (url: string) => {
  const { pathname, href } = root.location;
  /* eslint-disable no-useless-escape */
  const regOrigin = /^(https?\:\/\/)?([\.\w-]+)+(:[0-9]+)?/;
  const regUrl = /^(https?\:\/\/)?([\.\w-]+)+(:[0-9]+)?([\/\w-]*)?/;
  // 配置地址路径前
  const regexpPath = /\/[\w-]+\/[\w-]+/;

  if (!url) {
    console.error('history push not url');
    return false;
  }

  // 是否相对地址，如：/m/short/trial
  if (!regOrigin.test(url)) {
    root.location.href = url;
    return false;
  }

  const newUrl = url.split(regOrigin)[4];

  // 域名地址相同
  // 跳转地址和当前地址不允许相同
  // 防止webpack多入口问题
  if (
    (root.appHistory && root.appHistory.push)
    && (url.match(regOrigin) || [])[0] === href.match(regOrigin)[0]
    && (url.match(regUrl) || [])[0] !== href.match(regUrl)[0]
    && (url.match(regexpPath) || [])[0] === pathname.match(regexpPath)[0]
    && newUrl
  ) {
    try {
      root.appHistory.push(newUrl);
    } catch (error) {
      root.location.href = url;
    }
  } else {
    root.location.href = url;
  }
};

/**
 * 解析UA浏览器
 * @return {string}   返回浏览器
 * 浏览器 app(I云保App)、wechat(微信)、chrome、safari、other、wxapp(小程序)
 */
export const parserBrowser = (): string => {
  let browser = 'other';

  switch (true) {
    // 微信
    case isInWechat:
      browser = 'wechat';
      break;
    // app内
    case isInApp:
      browser = 'app';
      break;
    // chrome
    case /chrome/.test(UA):
      browser = 'chrome';
      break;
    // safari
    case /safari/.test(UA):
      browser = 'safari';
      break;
    default:
  }

  return browser;
};

import md5 from 'blueimp-md5';

import {
  WindowProps,
  EngineProps,
} from '../types';

declare var window: WindowProps;

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
export const isObject = (value: any) => {
  return value && typeof value === 'object' && value.constructor === Object;
};

/**
 * 函数检测
 * @param func
 */
export const isFunction = (func: any) => {
  return typeof func === 'function';
};

/**
 * 比对数组，过滤values 值
 * @param array
 * @param values
 */
export const difference = (array: string[], values?: string[]) => {
  if (!(array && Array.isArray(array) && array.length)) {
    return [];
  }

  if (!(values && Array.isArray(values) && values.length)) {
    return array;
  }

  const result: string[] = [];

  array.forEach((key) => {
    if (values.indexOf(key) < 0) {
      result.push(key);
    }
  });

  return result;
};

type DiffchangeProps = {
  [propName: string]: any;
};

/**
 * 比对触发数据
 * @param {string[]} attrs 属性表
 * @param {object}   from  数据1
 * @param {object}   to    数据2
 */
export const diffchange = (
  attrs: string[],
  from: DiffchangeProps,
  to: DiffchangeProps,
) => {
  return attrs.some((key) => from[key] !== to[key]);
};

/**
 * 深复制
 * @param {array|object} data 数据
 */
export const deepCopy = (data: any) => {
  if (Array.isArray(data)) {
    return data.slice().map((item) => deepCopy(item));
  }

  if (Object.prototype.toString.call(data) === '[object Object]') {
    const keys = Object.keys(data);
    const dataProto = Object.getPrototypeOf(data);
    const out = (dataProto === Object.prototype) ? {} : Object.create(dataProto);

    keys.reduce((cur, key) => {
      cur[key] = deepCopy(data[key]);
      return cur;
    }, out);

    return out;
  }

  return data;
};

/**
 * 深断言
 * @param {array|object} data1 数据1
 * @param {array|object} data2 数据2
 */
export const deepAsset = (data1: any, data2: any) => {
  return JSON.stringify(data1) === JSON.stringify(data2);
};

/**
 * 对象是否值相等
 * @param {object} data1 数据1
 * @param {object} data2 数据2
 */
export const isEquals = (x: any, y: any) => {
  // x 和 y 未空，两边不相同
  if (x === y) return true;

  if (!(x instanceof Object) || !(y instanceof Object)) return false;

  // 必须完全相同原型链
  if (x.constructor !== y.constructor) return false;

  const keysX = Object.keys(x);
  const keysY = Object.keys(y);

  // 长度不相等
  if (keysX.length !== keysY.length) return false;

  for (let i = 0; i < keysX.length; i += 1) {
    const propName = keysX[i];

    // value等于object、function
    if (typeof x[propName] === 'object' || typeof x[propName] === 'function') {
      if (!deepAsset(x[propName], y[propName])) {
        return false;
      }
    } else if (x[propName] !== y[propName]) {
      return false;
    }
  }

  return true;
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
  const urlParams = {};
  const decode = (s) => decodeURIComponent(s.replace(pl, ' '));

  url = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, (_m: string, key: string, value: string): any => {
    urlParams[decode(key)] = decode(value);
  });

  return urlParams;
};

/**
 * 生成随机串
 */
export const uuid = (len: number = 32) => {
  /** **默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1*** */
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  const maxPos = $chars.length;
  let pwd = '';
  for (let i = 0; i < len; i += 1) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
};

/**
 * 首字母转换大写
 * @param {string} str  内容
 */
export const firstUpperCase = (str: string) => {
  return str.replace(/^\S/g, (s) => s.toUpperCase());
};

/**
 * 获取属性值
 * @param props
 */
const getPropsValue: any = (props: EngineProps) => {
  const {
    childrens,
    value,
    defaultValue,
    hidden,
    ...rest
  } = props;
  const values: any[] = [];

  if (rest && Object.keys(rest).length) {
    Object.keys(rest).forEach((key) => {
      values.push(props[key]);
    });
  }

  return values;
};

/**
 * 有一定规律ID
 * @param props
 */
export function lawTreeId(
  props: EngineProps,
) {
  const { childrens } = props;
  let data: any[] = getPropsValue(props);

  if (childrens && Array.isArray(childrens) && childrens.length) {
    childrens.forEach((item) => {
      data = data.concat(getPropsValue(item));
    });
  }

  const value = JSON.stringify(data);
  const hash = md5(value);

  return hash ? hash.toString() : value;
}

/**
 * 序列ID
 * @param {string} value     内容
 */
export function serialId(
  value: string,
) {
  const hash = md5(value);

  return hash ? hash.toString() : value;
}

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

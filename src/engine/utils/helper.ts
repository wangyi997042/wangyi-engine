import { isObject } from './tools';
import { getStore } from '../store/store';
import validates from './validates';

import {
  EngineProps,
} from '../types';

/**
 * form rules 全局规则
 * https://github.com/nevergiveup-j/react-form-validates
 */
export const validateRule = validates;

/**
 * 解析path转成数组
 * @param {string} path
 * return {array}
 */
export const resolvePath = (path: string | string[]) => {
  if (Array.isArray(path)) {
    return path;
  }

  const paths: any = [];

  if (typeof path === 'string') {
    path.replace(/([a-zA-Z0-9_]+)/g, (text) => paths.push(text));
  }

  return paths;
};

/**
 * 解析path转form字符串
 * @param {string | string[] | number[]} path  路径
 * return {string}
 */
export const resolvePathForm = (path: string | string[] | number[]): string => {
  if (typeof path === 'string') {
    return path;
  }

  if (path && Array.isArray(path) && path.length) {
    let names = '';

    path.forEach((key: string | number, index: number) => {
      // key = 1 || key = '1'
      if (typeof key === 'number' || /^\d+$/.test(key)) {
        names += `[${key}]`;
      } else {
        names += `${index !== 0 ? '.' : ''}${key}`;
      }
    });

    return names;
  }

  return '';
};

/**
 * 获取form唯一标志
 * @param {string} name 名字
 * @param {string|string[]|number[]} path 路径
 * return {string}
 */
export function getFormId(name?: string, path?: string | string[] | number[]) {
  if (path) {
    return `${resolvePathForm(path)}.${name}`;
  }

  return typeof name === 'undefined' ? '' : name;
}

/**
 * 循环子级
 * @param {string} name   名字
 * @param {any[]}  childs 子级数据
 */
const loopChilds = (
  name: string,
  childs: any[],
): any => {
  if (!(name && Array.isArray(childs) && childs.length)) {
    return {};
  }

  const len = childs.length;
  let _temp = {};
  let item: any;

  for (let i = 0; i < len; i++) {
    item = childs[i];

    if (!item) {
      return item;
    }

    if (name === item.name || name === item.dataBind) {
      return item;
    }

    if (item.childrens) {
      _temp = loopChilds(name, item.childrens);

      if (_temp && Object.keys(_temp).length) {
        return _temp;
      }
    }
  }

  return _temp;
};

/**
 * 查询子级
 * @param {string}  name    目标，支持name、path
 * @param {array}   childs  子级数据
 */
export const findChilds = (
  name: string,
  childs: any[],
): any => {
  if (!(name && childs && Array.isArray(childs))) {
    return [];
  }

  const paths = resolvePath(name);
  const len = childs.length;
  let _temps: any[] = [];
  let arrIndex = -1;
  let item: any;

  for (let i = 0; i < len; i++) {
    item = childs[i];
    arrIndex = paths.indexOf(item.name || item.dataBind);

    if (arrIndex >= 0) {
      // 查找最后Key
      if (arrIndex >= paths.length - 1) {
        _temps = item.childrens;
        break;
      } else if (item.childrens) {
        const findChild = loopChilds(name, item.childrens);

        if (
          findChild
          && Object.keys(findChild).length
          && findChild.childrens
        ) {
          _temps = findChild.childrens;
          break;
        }
      }
    } else if (item.childrens) {
      const findChild = loopChilds(name, item.childrens);

      if (
        findChild
        && Object.keys(findChild).length
        && findChild.childrens
      ) {
        _temps = findChild.childrens;
        break;
      }
    }
  }

  return _temps;
};

/**
 * 查询路径数据
 * @param {string} path 路径
 * @param {object} data 数据
 * return object
 */
export const findPath = (
  path: string | string[],
  data: EngineProps,
): any => {
  if (!(path && data)) {
    return {};
  }

  if (typeof data === 'string') {
    data = getStore(data);
  }

  let paths = resolvePath(path);
  let _temp = {};

  const { childrens } = data;

  // path 一级查询
  if (paths.indexOf(data.name) > -1 || paths.indexOf(data.dataBind) > -1) {
    const start = (paths.indexOf(data.name) > -1 ? paths.indexOf(data.name) : paths.indexOf(data.dataBind)) + 1;
    paths = paths.slice(start);
    path = paths.join('.');
  }

  if (paths.length < 1) {
    return data;
  }

  if (childrens && Array.isArray(childrens) && childrens.length) {
    const len = childrens.length;
    let arrIndex = -1;
    let item: any;

    for (let i = 0; i < len; i++) {
      item = childrens[i];
      arrIndex = paths.indexOf(item.name || item.dataBind);

      if (arrIndex >= 0) {
        // 查找最后Key
        if (arrIndex >= paths.length - 1) {
          _temp = item;
          break;
        } else if (item.childrens) {
          _temp = findPath(paths, item);

          if (_temp && Object.keys(_temp).length) {
            break;
          }
        }
      } else if (item.childrens) {
        _temp = findPath(paths, item);

        if (_temp && Object.keys(_temp).length) {
          break;
        }
      }
    }
  }

  return _temp;
};

/**
 * 查询一组名字
 * @param {string[]} names 目标name
 * @param {ojbect}   data  数据
 * @param {string}   path  路径，非必传
 * return any[]
 */
export const findNames = (
  names: string[],
  data: any = {},
  path?: string,
): any[] => {
  if (!(Array.isArray(names) && names.length)) {
    return [];
  }

  const { name, dataBind, childrens } = data;

  // 一级查询
  if (names.indexOf(name) > -1 || names.indexOf(dataBind) > -1) {
    return [data];
  }

  // 无子级数据
  if (!(childrens && Array.isArray(childrens) && childrens.length)) {
    return [];
  }

  // 指定路径获取
  if (path) {
    const findData = findPath(path, data);
    const paths = resolvePath(path);
    let arrIndex: number = -1;

    if (
      findData
      && findData.childrens
      && Array.isArray(findData.childrens)
      && findData.childrens.length
    ) {
      return names.map((n) => {
        arrIndex = paths.indexOf(n);

        // 最后一个name相同，不查询
        if (arrIndex >= paths.length - 1) {
          return findData;
        }

        return loopChilds(n, findData.childrens);
      });
    }

    return [];
  }

  return names.map((n) => loopChilds(n, childrens));
};

/**
 * 查询目标
 * @param {string}        name  目标name
 * @param {object|string} data  查询数据|数据ID(storeId)，非必传，必须设置storeId，会从storeId取值
 * @param {string}        path  路径,非必传
 * return object
 */
export const findName = (
  name: string,
  data: EngineProps,
  path?: string,
): any => {
  if (!(name && data)) {
    return {};
  }

  if (typeof data === 'string') {
    data = getStore(data);
  }

  let findData = findNames([name], data, path);
  const len = findData.length;

  // 未查询数据 && path中dataBind值。form current dataBind has childrens
  if (len <= 0 && path && path.match(name)) {
    findData = findPath(path, data);
  }

  return (findData && Array.isArray(findData) && findData.length) ? findData[0] : (findData || {});
};

/**
 * 更新默认Value
 * @param {string}        name  查询名字
 * @param {any}           value 更新值
 * @param {object|string} data  查询数据|数据ID(storeId)，非必传，必须设置storeId，会从storeId取值
 * @param {string}        path  路径，非必传
 * return object
 */
export const updatePropsValue = (
  name: string,
  value: any,
  data?: any,
  path?: string,
): any => {
  if (typeof data === 'string') {
    data = getStore(data);
  }

  if (typeof value === 'undefined') {
    return data;
  }

  const item = findName(name, data, path);

  item.value = value;

  return data;
};

/**
 * 更新属性值
 * @param {string}        name  查询名字
 * @param {object}        value 更新值
 * @param {object|string} data  查询数据|数据ID(storeId)，非必传，必须设置storeId，会从storeId取值
 * @param {string}        path  路径，非必传
 */
export const updateProps = (name: string, props: EngineProps, data?: any, path?: string): EngineProps => {
  if (typeof data === 'string') {
    data = getStore(data);
  }

  if (!props) {
    return data;
  }

  let item = findName(name, data, path);
  const { wprops, childrens } = props;

  if (item && Object.keys(item).length) {
    item = Object.assign(item, {
      value: props.value,
      wprops,
      childrens,
    });
  }

  return data;
};

/**
 * 更新属性Value
 * @param {object}        value     更新值
 * @param {object|string} data  查询数据|数据ID(storeId)，非必传，必须设置storeId，会从storeId取值
 * return object
 */
export const updateDefaultValue = (value: any, data?: any): EngineProps => {
  if (typeof data === 'string') {
    data = getStore(data);
  }

  if (!value) {
    return data;
  }

  let val: any = null;
  let item: any = {};

  Object.keys(value).map((key) => {
    val = value[key];
    item = findName(key, data);

    if (Object.keys(item).length) {
      if (item.childrens && (Array.isArray(val) || isObject(val))) {
        updateDefaultValue(val, item);
      } else {
        item.value = val;
      }
    }

    return key;
  });

  return data;
};

/**
 * 重置值组件Value
 * @param {object|string} data  查询数据|数据ID(storeId)，非必传，必须设置storeId，会从storeId取值
 * return object
 */
export const resetValues = (data: any) => {
  if (!data) {
    return {};
  }

  if (typeof data === 'string') {
    data = getStore(data);
  }

  if (isObject(data)) {
    const { value, childrens } = data;

    if (value) {
      delete data.value;
    }

    if (childrens && Array.isArray(childrens) && childrens.length) {
      childrens.forEach((item) => {
        resetValues(item);
      });
    }
  }

  return data;
};

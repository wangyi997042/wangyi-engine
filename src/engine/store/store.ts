import {
  EngineProps,
} from '../types';

let root: {
  [propName: string]: any;
} = {};

if (typeof window !== 'undefined') {
  root = window;
}

root.CRE_DATA = {};

/**
 * 设置引擎数据
 * @param {object} data  数据
 * @param {string} id    唯一ID
 * return {object || null}
 */
export const addStore = (data: EngineProps, id: string) => {
  if (id) {
    root.CRE_DATA[id] = data;
  }

  return data;
};

/**
 * 获取全部数据
 * return {object}
 */
export const getStoreAll = () => {
  return root.CRE_DATA;
};

/**
 * 获取ID数据
 * @param {string} id  唯一ID
 * return {object || null}
 */
export const getStore = (id: string) => {
  if (id) {
    return root.CRE_DATA[id];
  }

  return null;
};

/**
 * 删除数据
 * @param {string} id  唯一ID
 * return {boolean}
 */
export const deleteStore = (id: string) => {
  if (id) {
    delete root.CRE_DATA[id];
    return true;
  }

  return false;
};

/**
 * 清除数据
 * return {boolean}
 */
export const clearStore = () => {
  const keys = Object.keys(root.CRE_DATA);

  if (keys.length) {
    keys.forEach((key) => {
      delete root.CRE_DATA[key];
      return key;
    });

    return true;
  }

  return false;
};

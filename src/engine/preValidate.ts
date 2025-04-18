import { isObject, isFunction } from './utils/tools';
import { findName } from './utils/helper';
import { getStore } from './store/store';
import { toast } from './action';

interface OptionsProps {
  path?: string;
  form?: any;
  storeId: string;
}

interface PreValidateProps {
  form?: any;
  value?: any;
}

type successCbProps = (values?: any) => void;

type errorCbProps = (errors?: any) => void;

/**
 * 前置验证Form表单
 * @param {array}    data      验证规则
 * @param {object}   options   配置
 * @config {object}  form      form验证
 * @config {string}  path      路径
 * @param {function} successCb 成功回调
 * @param {function} errorCb   失败回调
 */
export const preValidateForm = (
  data: any[],
  options: OptionsProps,
  successCb: successCbProps,
  errorCb?: errorCbProps,
) => {
  if (!(data && Array.isArray(data) && data.length)) {
    if (errorCb && isFunction(errorCb)) {
      errorCb('not data');
    }
    return false;
  }

  const { path, form } = options;
  const names: string[] = [];

  if (!form) {
    console.error('not options.form');
    return false;
  }

  let pathName = '';

  data.map((item) => {
    pathName = (path ? `${path}.${item.target}` : item.target);
    names.push(pathName);
    return item;
  });

  form.validateFields(names, {}, (errors: any, values: any) => {
    if (errors) {
      if (errorCb && isFunction(errorCb)) {
        errorCb(errors);
      }
      return false;
    }

    if (isFunction(successCb)) {
      successCb(values);
    }
  });
};

/**
 * 前置验证属性
 * @param {array}    data      验证规则
 * @param {object}   options   配置
 * @config {string}  path      路径
 * @config {string}  CRE_ID    数据ID，非必传
 * @param {function} successCb 成功回调
 * @param {function} errorCb   失败回调
 */
export const preValidateProps = (
  data: any[],
  options: OptionsProps,
  successCb: successCbProps,
  errorCb?: errorCbProps,
) => {
  if (!(data && Array.isArray(data) && data.length)) {
    if (errorCb && isFunction(errorCb)) {
      errorCb('not data');
    }
    return false;
  }

  if (!(options && options.storeId)) {
    if (errorCb && isFunction(errorCb)) {
      errorCb('not options.storeId');
    }
    return false;
  }

  const { path, storeId } = options;

  const dataSource = getStore(storeId);

  let findItem: any = {};
  const values: any = {};
  const errors: any = {};
  let firstMessage: string = '';

  data.map((item) => {
    findItem = findName(item.target, dataSource, path);

    if (findItem.value && findItem.value === item.value) {
      values[item.target] = item.value;
    } else {
      errors[item.target] = item.message;

      if (item.message) {
        firstMessage = item.message;
      }
    }
    return item;
  });

  if (isObject(errors) && Object.keys(errors).length) {
    if (errorCb && isFunction(errorCb)) {
      errorCb(errors);
    }

    toast(firstMessage);
  } else if (isFunction(successCb)) {
    successCb(values);
  }
};

/**
 * 前置验证
 * @param {object}    data      验证规则
 * @param {object}   options   配置
 * @config {object}  form      form验证
 * @config {string}  path      路径
 * @config {string}  CRE_ID    数据ID，非必传
 * @param {function} successCb 成功回调
 * @param {function} errorCb   失败回调
 */
export const preValidate = (
  data: PreValidateProps,
  options: OptionsProps,
  successCb: successCbProps,
  errorCb?: errorCbProps,
) => {
  if (!(data && isObject(data))) {
    if (errorCb && isFunction(errorCb)) {
      errorCb('set preValidate props');
    }
    return false;
  }

  try {
    let preItem = [];
    Object.keys(data).map((key) => {
      preItem = data[key];

      switch (key) {
        // form 验证
        case 'form':
          preValidateForm(preItem, options, successCb, errorCb);
          break;
        // value相同
        case 'props':
          preValidateProps(preItem, options, successCb, errorCb);
          break;
        default:
          break;
      }

      return key;
    });
  } catch (error) {
    console.error('preValidate==', error);
  }
};

export default preValidate;

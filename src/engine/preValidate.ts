import _get from 'lodash.get';
import _set from 'lodash.set';
import { isObject } from './utils/tools';
import { resolvePath } from './utils/helper';
import { toast } from './action/oldaction';
import { TPath, IWidgetData } from './render';

interface OptionsProps {
  form?: any;
  nameMap: any;
}

type TPreProps = ({
  target: TPath;
  message: string;
} & IWidgetData)[];

export interface IPreValidateProps {
  props?: TPreProps;
}

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
  data: TPreProps | undefined,
  options: any,
) => {
  if (!Array.isArray(data)) {
    return Promise.reject(Error('验证规则数据不对'));
  }

  const { nameMap } = options;

  let findItem: any = {};
  const values: any = {};
  const errors: any = {};
  let firstMessage = '';

  data.forEach((item) => {
    findItem = _get(nameMap, resolvePath(item.target))?._data;

    if (findItem.value && findItem.value === item.value) {
      _set(values, item.target, item.value);
    } else {
      _set(errors, item.target, item.message);

      if (item.message) {
        firstMessage = item.message;
      }
    }
  });

  if (isObject(errors) && Object.keys(errors).length) {
    toast(firstMessage);

    return Promise.reject(errors);
  }

  return Promise.resolve(values);
};

/**
 * 前置验证
 * @param {object}    data      验证规则
 * @param {object}   options   配置
 */
export const preValidate = (
  data: IPreValidateProps,
  options: OptionsProps,
) => {
  if (!isObject(data)) {
    return Promise.reject(Error('验证规则数据格式错误'));
  }

  try {
    let preItem: any = [];

    return Promise.all(Object.keys(data).map((key) => {
      preItem = data[(key as 'props')];

      switch (key) {
        // value相同
        case 'props':
          return preValidateProps(preItem, options);
        default:
          return Promise.reject(Error('只支持props校验'));
      }
    }));
  } catch (error) {
    return Promise.reject(error);
  }
};

export default preValidate;

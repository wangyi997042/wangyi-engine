import { findTreeNames } from '../tree';
import { findId } from '../dataMaps';
import { isObject } from './tools';
import * as filters from './evalFilters';
import {
  resolvePath,
  resolvePathForm,
} from './helper';

import {
  TreeProps,
  DataMapsProps,
  DataComponentMap,
} from '../types';

/**
 * 执行条件
 * @param {string} expression  判断条件
 * @param {object} data        数据
 * @return {boolean}
 */
export const evalExpression = (expression: string, data?: any): boolean => {
  try {
    /* eslint-disable-next-line */
    const fn = new Function(
      'data',
      'utils',
      `with(data) {${/^\s*return\b/.test(expression) ? '' : 'return '}${expression};}`,
    );

    data = data || {};

    return fn.call(data, data, filters);
  } catch (error) {
    console.info(error);
    return false;
  }
};

/* eslint-disable-next-line */
export const REG_EXPRESSION_PATH = /([a-zA-Z0-9_\.\[\]]+)\s*([<>!=]+)\s*([a-zA-Z0-9_\'\"]+)/g;
/* eslint-disable-next-line */
export const REG_UTILS_PATH = /(utils\.[a-zA-Z0-9_]+\()([a-zA-Z0-9_\.\[\]]+)(.*?\))/g;
// reg function
/* eslint-disable-next-line */
export const REG_FUNCTION_PATH = /^\(function\(\)\{(.+)\}\)\(\);?$/;
/* eslint-disable-next-line */
export const RGE_VAR_NAME = /\$([a-zA-Z0-9_\.\[\]]+)/g;

/**
 * 条件插入数组值
 * @param {string}  name     目标
 * @param {object}  arrayPos 数组位置
 * return {string}
 */
export function nameInsertArray(name: string, arrayPos: any): string {
  if (
    arrayPos
    && isObject(arrayPos)
    && typeof arrayPos.index === 'number'
  ) {
    const namePaths = resolvePath(name);
    const { index } = arrayPos || {};

    if (arrayPos && Array.isArray(namePaths) && namePaths.length > 1) {
      const aIndex = namePaths.indexOf('cert');

      // 选择证件组件，特殊处理
      if (aIndex > -1 && namePaths.indexOf('certType') > -1) {
        namePaths.splice(aIndex, 0, index);
      } else {
        namePaths.splice(namePaths.length - 1, 0, index);
      }

      name = resolvePathForm(namePaths);
    }
  }

  return name;
}

/**
 * 解析value
 * @param {object} data 数据
 * @param {string} name 查询name
 * return {string}
 */
const parseValue = (
  data: DataComponentMap,
  name?: string,
) => {
  const { widget, dataBind, value, defaultValue, wprops } = data || {};
  let initialValue = (typeof value === 'undefined' ? defaultValue : value);

  // value对象
  if (initialValue && isObject(initialValue)) {
    // 选择证件组件
    if (
      widget === 'select-cert'
      && wprops
      && isObject(wprops.label)
      && wprops.label.dataBind
    ) {
      let tempName = '';

      // value object last
      if (name && dataBind) {
        const names = name.split('.') || [];
        const index = names.indexOf(dataBind);

        if (index > -1 && names.length - 1 > index) {
          tempName = names[index + 1];
        } else {
          tempName = wprops.label.dataBind;
        }
      } else {
        tempName = wprops.label.dataBind;
      }

      initialValue = initialValue[tempName];
    }
  }

  return initialValue;
};

/**
 * 执行条件路径
 * @param {string}  expression 条件
 * @param {object}  tree       树结构
 * @param {object}  dataMaps   组件表
 * @param {object}  arrayPos   数组位置
 * @param {boolean} isString   需要目标值
 * return boolean | object
 */
export function evalExpressionPath(
  expression: string,
  tree: TreeProps,
  dataMaps: DataMapsProps,
  arrayPos?: any,
  isString?: boolean,
): boolean | any {
  const names: string[] = [];
  // 对象创建占位符
  const namePlaceholders: string[] = [];
  let placeholder: string = '';
  let posIndex = -1;
  const values = {};

  // 匹配(function{})()
  if (REG_FUNCTION_PATH.test(expression)) {
    // 匹配 $xx
    if (RGE_VAR_NAME.test(expression)) {
      expression = expression.replace(RGE_VAR_NAME, (
        _and: string,
        name: string,
        index: number,
      ): any => {
        posIndex = names.indexOf(name);

        // array key has
        if (posIndex >= 0) {
          placeholder = namePlaceholders[posIndex];
        } else {
          placeholder = `$name${index}`;

          // 条件插入数组值
          if (arrayPos) {
            name = nameInsertArray(name, arrayPos);
          }

          names.push(name);
          namePlaceholders.push(placeholder);
        }

        return placeholder;
      });
    }
  // xx === '1'
  } else {
    if (REG_EXPRESSION_PATH.test(expression)) {
      expression = expression.replace(REG_EXPRESSION_PATH, (
        _and: string,
        name: string,
        operators: string,
        value: string,
        index: number,
      ): any => {
        posIndex = names.indexOf(name);

        // array key has
        if (posIndex >= 0) {
          placeholder = namePlaceholders[posIndex];
        } else {
          placeholder = `$name${index}`;

          // 条件插入数组值
          if (arrayPos) {
            name = nameInsertArray(name, arrayPos);
          }

          names.push(name);
          namePlaceholders.push(placeholder);
        }

        return `${placeholder} ${operators} ${value}`;
      });
    }

    // 匹配工具路径 utils.getXxx(path)
    if (REG_UTILS_PATH.test(expression)) {
      expression = expression.replace(REG_UTILS_PATH, (
        _and: string,
        method: string,
        name: string,
        after: string,
        index: number,
      ): any => {
        posIndex = names.indexOf(name);

        // array key has
        if (posIndex >= 0) {
          placeholder = namePlaceholders[posIndex];
        } else {
          placeholder = `$utilsName${index}`;

          // 条件插入数组值
          if (arrayPos) {
            name = nameInsertArray(name, arrayPos);
          }

          names.push(name);
          namePlaceholders.push(placeholder);
        }

        return `${method}${placeholder}${after}`;
      });
    }
  }

  const findTree = (names.length ? findTreeNames(names, tree) : []);
  let componentData: DataComponentMap;
  let name: string = '';
  let treeItem: any = null;

  if (names && Array.isArray(names) && names.length) {
    names.forEach((_item, key) => {
      // 树结构获取ID，查询组件Maps value
      if (findTree[key]) {
        treeItem = findTree[key];
        componentData = findId(treeItem.id, dataMaps);

        if (componentData) {
          name = names[key];
          values[namePlaceholders[key]] = parseValue(componentData, name);
        }
      } else {
        values[namePlaceholders[key]] = undefined;
      }
    });
  }

  // 特定场景
  if (isString) {
    let valueString = '';
    let tempValue: string = '';
    let valueQueue: any[] = [];

    if (values && Object.keys(values).length) {
      Object.keys(values).forEach((key) => {
        tempValue = values[key];

        if (tempValue && isObject(tempValue)) {
          valueQueue = [];

          Object.keys(tempValue).forEach((v) => {
            // typeof not object、array
            if (typeof tempValue[v] !== 'object') {
              valueQueue.push(tempValue[v]);
            }
          });

          valueString += valueQueue.join(',');
        } else {
          valueString += tempValue;
        }
      });
    }

    return {
      valueString,
      result: evalExpression(expression, values),
    };
  }

  return evalExpression(expression, values);
}

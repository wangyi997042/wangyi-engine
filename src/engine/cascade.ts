import { isObject, deepCopy, lawTreeId } from './utils/tools';
import { evalExpressionPath } from './utils/expression';
import validateRule from './utils/validates';
import { getStore } from './store/store';
import { findName, getFormId } from './utils/helper';
import CreateTree from './tree';
import CreateDataMaps from './dataMaps';

import {
  TreeProps,
  DataMapsProps,
  EngineProps,
} from './types';

export interface ChangeProps {
  widget: string;
  name: string;
  defaultValue: any;
  value: any;
  path?: string;
  cascade: any;
  wprops: any;
  form?: any;
  prefixCls?: string;
  children?: any;
}

export interface ItemProps {
  target: string;
  path?: string;
  value?: any;
  wprops?: any;
  validate?: any;
  pattern?: string;
  message?: string;
}

// 临时
const localData: {
  [propName: string]: any;
} = {};

// 锁form
let setValueLock: {
  [propName: string]: any;
} = {};

let lockTime: any = null;

/**
 * 清除锁
 */
const clearLock = () => {
  lockTime && clearTimeout(lockTime);

  lockTime = setTimeout(() => {
    setValueLock = {};
  }, 300);
};

/**
 * 联动显示/隐藏
 * @param  {array}  items   位置
 * @config {string} target  指定目标
 * @config {string} path    路径
 * @param  {object} data    全部数据
 * @param  {string}  path   渲染路径
 * @param  {boolean} toggle 切换显示/隐藏，默认隐藏
 * return data
 */
const cascadeToggle = (items: any, data: any, path?: string, toggle: any = null) => {
  if (!Array.isArray(items)) {
    return data;
  }

  let targetData: any = {};

  items.map((item: ItemProps) => {
    targetData = findName(item.target, data, (path || item.path));

    if (Object.keys(targetData).length) {
      targetData.hidden = ((typeof toggle === 'boolean') ? toggle : !targetData.hidden);
    }

    return item;
  });

  return data;
};

/**
 * 更新数据
 * @param  {array}  items   位置
 * @config {string} target  指定目标
 * @config {string} path    路径
 * @param  {object} data    全部数据
 * @param  {string}  path   渲染路径
 * @param  {boolean} toggle 切换显示/隐藏，默认隐藏
 * return data
 */
const cascadeUpdateProps = (items: any, data: any, path?: string) => {
  if (!Array.isArray(items)) {
    return data;
  }

  let targetData: any = {};

  items.map((item: ItemProps) => {
    targetData = findName(item.target, data, (path || item.path));

    if (Object.keys(targetData).length) {
      if (item.value) {
        targetData.value = item.value;
      }
      if (item.wprops) {
        targetData.wprops = Object.assign(targetData.wprops, item.wprops);
      }
    }

    return item;
  });

  return data;
};

/**
 * 重置属性
 * @param  {array}  items   位置
 * @config {string} target  指定目标
 * @config {string} path    路径
 * @param  {object} data    全部数据
 * @param  {string}  path   渲染路径
 * return data
 */
const cascadeResetProps = (items: any, data: any, path?: string) => {
  if (!Array.isArray(items)) {
    return data;
  }

  let targetData: any = {};

  items.map((item: ItemProps) => {
    targetData = findName(item.target, data, (path || item.path));

    if (Object.keys(targetData).length) {
      if (item.wprops) {
        delete targetData.value;
      }
    }

    return item;
  });

  return data;
};

/**
 * 规则验证
 * @param  {array}  items   位置
 * @config {string} target  指定目标
 * @config {string} path    路径
 * @param  {object} data    全部数据
 * @param  {string}  path   渲染路径
 * return data
 */
const cascadeRulesProps = (items: any, data: any, path?: string) => {
  if (!Array.isArray(items)) {
    return data;
  }

  let targetData: any = {};
  let wprops: any = {};

  items.map((item: ItemProps) => {
    targetData = findName(item.target, data, (path || item.path));

    if (
      Object.keys(targetData).length
      && targetData.wprops
    ) {
      ({ wprops } = targetData);

      // 联动列表key = validate、pattern
      if (
        (item.validate && validateRule[item.validate])
        || item.pattern
      ) {
        // 目标规则
        if (wprops.validate && wprops.validate.rules) {
          // 保留初始规则，后面联动控制
          if (!wprops.validate.defaultRules) {
            wprops.validate.defaultRules = deepCopy(wprops.validate.rules);
          }

          // 正则规则
          if (item.pattern) {
            wprops.validate.rules = [
              ...wprops.validate.defaultRules,
              item,
            ];
          // 函数调用
          } else {
            wprops.validate.rules = [
              ...wprops.validate.defaultRules,
              {
                validator: validateRule[item.validate],
              },
            ];
          }
        }
      // 还原验证
      } else if (wprops.validate && wprops.validate.defaultRules) {
        wprops.validate.rules = [...wprops.validate.defaultRules];
      }
    }

    return item;
  });

  return data;
};

/**
 * 联动触发
 * @param {object}        props  列表
 * @param {object|string} data   查询数据|渲染引擎ID(CRE_ID)，非必传，必须设置CRE_ID，会从CRE_ID取值
 * @param {string}        path   渲染路径
 * return data
 */
const cascadeChange = (props: ChangeProps, data: any, path?: string) => {
  if (typeof data === 'string') {
    data = getStore(data);
  }

  const { wprops } = props;
  // props.cascade 升级渲染引擎，兼容旧的联动
  let { value, cascade } = props;

  if (wprops && wprops.cascade) {
    ({ cascade } = wprops);
  }

  if (!cascade) {
    return false;
  }

  value = (typeof value === 'undefined' ? props.defaultValue : value);

  try {
    if (cascade._default || cascade[value]) {
      const cascadeType = (cascade._default || cascade[value]);

      Object.keys(cascadeType).map((key) => {
        const items = cascadeType[key];
        switch (key) {
          // 隐藏组件
          case 'hidden':
            cascadeToggle(items, data, path, true);
            break;
          // 可见组件
          case 'visible':
            cascadeToggle(items, data, path, false);
            break;
          // 可见、隐藏切换
          case 'toggle':
            cascadeToggle(items, data, path);
            break;
          // 更新属性
          case 'update':
            cascadeUpdateProps(items, data, path);
            break;
          // 重置属性
          case 'reset':
            cascadeResetProps(items, data, path);
            break;
          // form 验证规则
          case 'rules':
            cascadeRulesProps(items, data, path);
            break;
          default:
            break;
        }

        return items;
      });
    }
  } catch (error) {
    console.error(new Error(error));
  }

  return data;
};

/**
 * 全部联动触发
 * @param {object|string} data   查询数据|渲染引擎ID(CRE_ID)，非必传，必须设置CRE_ID，会从CRE_ID取值
 * return data
 */
const cascadeAllChange = (data: any) => {
  if (typeof data === 'string') {
    data = getStore(data);
  }

  const { childrens } = data;

  if (childrens && Array.isArray(childrens) && childrens.length) {
    childrens.forEach((item) => {
      if (item.wprops && item.wprops.cascade) {
        cascadeChange(item, data);
      }

      if (item.childrens && Array.isArray(childrens) && childrens.length) {
        cascadeAllChange(item);
      }
    });
  }

  return data;
};

/**
 * 更新组件Map属性
 * @param  {any[]} items        条件、修改内容
 * @config {string} expression  条件
 * @config {any} value          组件值
 * @config {object} wprops      组件属性
 * @param  {object} tree        树结构
 * @param  {ojbect} dataMaps    组件Maps
 * @param  {string} id          当前组件Maps Id
 * @param  {object} form        type update form reset
 * @param  {object} arrayPos    数组位置
 */
const cascadeUpdateMap = (
  items: any[],
  tree: TreeProps,
  dataMaps: DataMapsProps,
  fork: TreeProps,
  form?: any,
  arrayPos?: any,
): DataMapsProps => {
  if (!Array.isArray(items)) {
    return dataMaps;
  }

  const { id, path } = fork || {};
  const dataMap: any = dataMaps[id];

  if (dataMap) {
    const newProps: any = {};
    const len = items.length;
    let item: any = {};
    let valueStringExp = '';

    for (let i = 0; i < len; i++) {
      item = items[i] || {};
      const { expression, ...rest } = item;

      if (expression && rest && Object.keys(rest).length) {
        const { valueString, result } = evalExpressionPath(expression, tree, dataMaps, arrayPos, true);

        valueStringExp = valueString;

        if (result) {
          if (typeof item.value !== 'undefined' && dataMap.value !== item.value) {
            newProps.value = item.value;
          // 函数返回value
          } else if (isObject(result) && typeof result.value !== 'undefined') {
            newProps.value = result.value;
          }

          if (item.wprops) {
            // 函数返回
            if (isObject(result) && Object.keys(result).length) {
              const { value, ...reset } = result;
              newProps.wprops = reset;
            } else {
              newProps.wprops = item.wprops;
            }
          }

          break;
        }
      }
    }

    if (newProps && Object.keys(newProps).length) {
      const { value, wprops } = newProps;
      const names = (dataMap.dataBind ? getFormId(dataMap.dataBind, path) : '');

      // if (typeof value !== 'undefined' && dataMap.value !== value && valueStringExp !== localData[names]) {
      if (typeof value !== 'undefined' && dataMap.value !== value && dataMap._cascadeValue !== value) {
        dataMap.value = value;
        dataMap._cascadeValue = value;

        // set form value
        if (form && names && !setValueLock[names]) {
          // use setFieldsValue loop error
          // form.resetFields([names]);

          form.setFieldsValue({
            [names]: value,
          });

          // 设置值锁
          setValueLock[names] = true;
        }
      }

      if (wprops) {
        dataMap.wprops = {
          ...dataMap.wprops,
          ...wprops,
        };
      }

      localData[names] = valueStringExp;
    }
  }

  return dataMaps;
};

/**
 * 替换组件Map属性
 * @param  {any[]} items        条件、修改内容
 * @config {string} expression  条件
 * @config {any} value          组件值
 * @config {object} wprops      组件属性
 * @param  {object} tree        树结构
 * @param  {ojbect} dataMaps    组件Maps
 * @param  {string} fork        当前树枝
 * @param  {object} form        type update form reset
 */
const cascadeReplaceMap = (
  items: any[],
  tree: TreeProps,
  dataMaps: DataMapsProps,
  fork: TreeProps,
  form?: any,
  arrayPos?: any,
): DataMapsProps => {
  if (!Array.isArray(items)) {
    return dataMaps;
  }

  let wItem: any = null;
  let sourceItem: any = null;
  const { id, path } = fork || {};

  const dataMap: any = dataMaps[id];

  if (dataMap) {
    const newProps: any = {};
    const len = items.length;
    let item: any = {};
    let valueStringExp = '';

    for (let i = 0; i < len; i++) {
      item = items[i] || {};
      const { expression, ...rest } = item;

      if (expression && rest && Object.keys(rest).length) {
        const { valueString, result } = evalExpressionPath(expression, tree, dataMaps, arrayPos, true);

        valueStringExp = valueString;

        if (result) {
          if (typeof item.value !== 'undefined' && dataMap.value !== item.value) {
            newProps.value = item.value;
          // 函数返回value
          } else if (isObject(result) && typeof result.value !== 'undefined') {
            newProps.value = result.value;
          }

          if (item.wprops) {
            // 函数返回
            if (isObject(result) && Object.keys(result).length) {
              const { value, ...reset } = result;
              newProps.wprops = reset;
            } else {
              newProps.wprops = item.wprops;
            }
          }
          break;
        }
      }
    }

    if (newProps && Object.keys(newProps).length) {
      const { value, wprops } = newProps;
      const names = (dataMap.dataBind ? getFormId(dataMap.dataBind, path) : '');

      // if (typeof value !== 'undefined' && valueStringExp !== localData[names]) {
      if (typeof value !== 'undefined' && dataMap.value !== value && dataMap._cascadeValue !== value) {
        dataMap.value = value;
        dataMap._cascadeValue = value;

        // set form value
        if (form && names && !setValueLock[names]) {
          // use setFieldsValue loop error
          // form.resetFields([names]);

          form.setFieldsValue({
            [names]: value,
          });

          // 设置值锁
          setValueLock[names] = true;
        }
      }

      if (wprops && isObject(wprops)) {
        Object.keys(wprops).forEach((key) => {
          wItem = wprops[key];
          sourceItem = dataMap.wprops[key];

          // options 数组
          if (wItem && Array.isArray(wItem) && wItem.length) {
            wItem.forEach((v, k) => {
              if (v === null || v === undefined) {
                return false;
              }

              if (isObject(v)) {
                sourceItem[k] = {
                  ...sourceItem[k],
                  ...v,
                };
              } else {
                sourceItem[k] = v;
              }
            });
          } else {
            sourceItem = wItem;
          }
        });
      }

      localData[names] = valueStringExp;
    }
  }

  return dataMaps;
};

/**
 * 重置组件Map属性
 * @param  {any[]}  items       条件、修改内容
 * @config {string} expression  条件
 * @config {any}    value       组件值
 * @config {object} wprops      组件属性
 * @param  {object} tree        树结构
 * @param  {ojbect} dataMaps    组件Maps
 * @param  {string} id          组件Maps Id
 */
const cascadeResetMap = (
  items: any[],
  tree: TreeProps,
  dataMaps: DataMapsProps,
  id: string,
  arrayPos?: any,
) => {
  if (!Array.isArray(items)) {
    return dataMaps;
  }

  items.forEach((item: any) => {
    const { expression, ...props } = item || {};

    if (id && expression && evalExpressionPath(expression, tree, dataMaps, arrayPos)) {
      const dataMap = dataMaps[id];

      if (typeof props.wprops === 'undefined') {
        delete dataMap.wprops;
      } else {
        dataMap.wprops = props.wprops;
      }

      if (typeof props.value === 'undefined') {
        delete dataMap.value;
      } else {
        dataMap.value = props.value;
      }
    }
  });

  return dataMaps;
};

/**
 * 更新规则验证
 * @param  {any[]}  items       条件、修改内容
 * @config {string} expression  条件
 * @config {any}    value       组件值
 * @config {object} wprops      组件属性
 * @param  {object} tree        树结构
 * @param  {ojbect} dataMaps    组件Maps
 * @param  {string} id          组件Maps Id
 */
const cascadeRulesMap = (
  items: any[],
  tree: TreeProps,
  dataMaps: DataMapsProps,
  id: string,
  arrayPos?: any,
) => {
  if (!Array.isArray(items)) {
    return dataMaps;
  }

  let wprops: any = {};

  items.forEach((item: any) => {
    const { expression, ...props } = item || {};

    if (id && expression && evalExpressionPath(expression, tree, dataMaps, arrayPos)) {
      ({ wprops } = dataMaps[id]);

      // validate function， 正则 pattern
      if (
        (props.validate && validateRule[props.validate])
        || props.pattern
      ) {
        // 组件map存在属性
        if (wprops.validate && wprops.validate.rules) {
          // 保留初始form规则，查找不到规则还原
          if (!wprops.validate.defaultRules) {
            wprops.validate.defaultRules = deepCopy(wprops.validate.rules);
          }

          // form test rules
          if (item.pattern) {
            wprops.validate.rules = [
              ...wprops.validate.defaultRules,
              props,
            ];
          // string to function
          } else {
            wprops.validate.rules = [
              ...wprops.validate.defaultRules,
              {
                validator: validateRule[props.validate],
              },
            ];
          }
        }
      // 还原验证规则
      } else if (wprops.validate && wprops.validate.defaultRules) {
        wprops.validate.rules = [...wprops.validate.defaultRules];
      }
    }
  });

  return dataMaps;
};

/**
 * 监听联动
 * @param {object} props     目标
 * @param {object} tree      树结构
 * @param {object} dataMaps  组件数据
 * @param {object} form      type update form reset
 */
export function cascadeOnChange(
  props: TreeProps,
  tree: TreeProps,
  dataMaps: DataMapsProps,
  form?: any,
) {
  const { id, cascadeOn } = props || {};

  if (cascadeOn && isObject(cascadeOn)) {
    let cascadeValue: any = '';
    const { arrayPos, ...restCascadeOn } = cascadeOn;

    Object.keys(restCascadeOn).map((key) => {
      cascadeValue = cascadeOn[key];

      // string transform array
      if (!(cascadeValue && Array.isArray(cascadeValue) && cascadeValue.length)) {
        cascadeValue = [cascadeValue];
      }

      switch (key) {
        // 隐藏组件
        case 'hidden':
          props.hidden = evalExpressionPath(cascadeValue[0], tree, dataMaps, arrayPos);
          break;
        // 可见组件
        case 'visible':
          props.hidden = !evalExpressionPath(cascadeValue[0], tree, dataMaps, arrayPos);
          break;
        // 更新属性
        case 'update':
          cascadeUpdateMap(cascadeValue, tree, dataMaps, props, form, arrayPos);
          break;
        // 替换属性
        case 'replace':
          cascadeReplaceMap(cascadeValue, tree, dataMaps, props, form, arrayPos);
          break;
        // 重置属性
        case 'reset':
          cascadeResetMap(cascadeValue, tree, dataMaps, id, arrayPos);
          break;
        // form 验证规则
        case 'rules':
          cascadeRulesMap(cascadeValue, tree, dataMaps, id, arrayPos);
          break;
        default:
          break;
      }

      return key;
    });
  }

  return tree;
}

/**
 * 监听全部联动，？？主动触发联动
 * @param {object}        tree      树
 * @param {object|string} dataMaps  组件dataMaps
 * @param {object}        form      type update form reset
 * return data
 */
export function cascadeOnAll(
  tree: TreeProps,
  dataMaps: DataMapsProps,
  rootTree?: TreeProps,
  form?: any,
) {
  const { childNodes } = tree;
  const newTree = rootTree || tree;

  if (childNodes && Array.isArray(childNodes) && childNodes.length) {
    childNodes.forEach((item) => {
      if (item && item.cascadeOn && isObject(item.cascadeOn) && Object.keys(item.cascadeOn).length) {
        cascadeOnChange(item, newTree, dataMaps, form);
      }

      if (item.childNodes && Array.isArray(item.childNodes)) {
        cascadeOnAll(item, dataMaps, newTree, form);
      }
    });
  }

  // clear form set value
  clearLock();

  return tree;
}

/**
 * 更新联动数据
 * @param {object} data  数据
 * @param {object} tree  树结构
 */
const updateCascadeData = (data: EngineProps, tree: TreeProps) => {
  if (isObject(data)) {
    const { childrens } = data;
    const { hidden, childNodes } = tree;

    // 更新显示、隐藏
    if (typeof hidden !== 'undefined') {
      data.hidden = hidden;
    }

    if (
      childrens
      && Array.isArray(childrens)
      && childrens.length
      && childNodes
      && Array.isArray(childNodes)
      && childrens.length
    ) {
      childrens.map((item, key) => {
        updateCascadeData(item, childNodes[key]);

        return item;
      });
    }
  }

  return data;
};

/**
 * 数据联动，页面不渲染。目前支持显示、隐藏
 * @param {object}  data  数据
 */
export function cascadeOnData(data: EngineProps) {
  if (!data) {
    return {};
  }

  const STORE_ID: any = `cascade_${lawTreeId(data)}`;
  const tree: any = new CreateTree(data, STORE_ID);
  const dataMaps: any = new CreateDataMaps(data, tree, STORE_ID);

  // 监控
  cascadeOnAll(tree, dataMaps);

  // 更新联动
  updateCascadeData(data, tree);

  return data;
}

/**
 * 同步数据
 */
export function cascadeSync() {

}

export default {
  cascadeChange,
  cascadeAllChange,
  cascadeOnChange,
  cascadeOnData,
  cascadeOnAll,
};

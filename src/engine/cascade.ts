import cloneDeep from 'lodash.clonedeep';
import { isObject } from './utils/tools';
import { runExpression } from './utils/expression';
import { pathsToString } from './utils/helper';
import { useUtils, TPath, IWidgetData } from './render';
import { TDataProxy, TNameMap } from './render/types';
import { runActions, ActionProps, TActionsProps } from './action';

interface ICascadeOnItem {
  expression?: string;
  value?: any;
  action?: TActionsProps;
  wprops?: {
    [key: string]: any;
  };
  [key: string]: any;
}

interface ICascader {
  formData: object;
  defaultData?: IWidgetData;
  dataProxy: TDataProxy;
  nameMap: TNameMap;
  nameIdMap: TNameMap;
  parentDataBinds?: TPath;
}

export interface ICascadeOn {
  hidden?: ICascadeOnItem[];
  visible?: ICascadeOnItem[];
  update?: ICascadeOnItem[];
  replace?: ICascadeOnItem[];
  reset?: ICascadeOnItem[];
  action?: ActionProps[];
}

/*
 * 合并两个对象的value和wprops属性
 * 以leftObj为主要对象，当rightObj中的属性不在leftObj时，把属性补充进去
*/
function assignObjWidth(leftObj: ICascadeOnItem, rightObj: ICascadeOnItem) {
  if (isObject(leftObj) && isObject(rightObj)) {
    if (!('value' in leftObj) && 'value' in rightObj) {
      leftObj.value = rightObj.value;
    }

    if (!('wprops' in leftObj) && 'wprops' in rightObj) {
      leftObj.wprops = rightObj.wprops;
    } else if (isObject(leftObj.wprops) && isObject(rightObj.wprops)) {
      Object.keys((rightObj.wprops as object)).forEach((key) => {
        if (!(key in (leftObj.wprops as object))) {
          (leftObj.wprops as { [key: string]: any })[key] = (rightObj.wprops as { [key: string]: any })[key];
        }
      });
    }
  }
}

export function assignObj(leftObj: ICascadeOnItem, rightObj: ICascadeOnItem) {
  if (isObject(leftObj) && isObject(rightObj)) {
    Object.keys(rightObj).forEach((key) => {
      if (key === 'wprops') {
        if (leftObj.wprops === undefined) {
          leftObj.wprops = rightObj.wprops;
        } else if (isObject(leftObj.wprops) && isObject(rightObj.wprops)) {
          Object.keys(rightObj.wprops).forEach((key) => {
            (leftObj.wprops as { [key: string]: any })[key] = (rightObj.wprops as { [key: string]: any })[key];
          });
        }
      } else {
        leftObj[key] = rightObj[key];
      }
    });
  }
}

export function resolvePath(expression: string, currentDataBinds?: TPath) {
  if (typeof expression === 'string') {
    return expression.replace(/\/\./g, () => {
      if (Array.isArray(currentDataBinds) && currentDataBinds.length > 0) {
        return `${pathsToString(currentDataBinds)}.`;
      }
      return '';
    });
  }

  return expression;
}

// 联动
export default function cascader(cascadeOn: ICascadeOn, options: ICascader): boolean {
  const { formData, parentDataBinds, dataProxy, defaultData: optionsDefaultData } = options;
  const defaultData = cloneDeep(optionsDefaultData);
  let hasChange = false;

  if (isObject(cascadeOn)) {
    let cascadeValue: any = '';

    Object.keys(cascadeOn).map((key) => {
      cascadeValue = cascadeOn[(key as keyof ICascadeOn)];

      if (!(Array.isArray(cascadeValue))) {
        cascadeValue = [cascadeValue];
      }

      switch (key) {
        // 隐藏组件
        case 'hidden':
          cascadeValue.forEach((item: ICascadeOnItem) => {
            const result = runExpression(resolvePath((item?.expression || item) as string, parentDataBinds), formData);

            if (!!dataProxy.hidden !== result.result) {
              dataProxy.hidden = !dataProxy.hidden;
              hasChange = true;
            }
          });
          break;
        // 可见组件
        case 'visible':
          cascadeValue.forEach((item: ICascadeOnItem) => {
            const result = runExpression(resolvePath((item?.expression || item) as string, parentDataBinds), formData);

            if (!!dataProxy.hidden === result.result) {
              dataProxy.hidden = !dataProxy.hidden;
              hasChange = true;
            }
          });
          break;
        // 更新属性
        case 'update':
          cascadeValue.forEach((item: ICascadeOnItem) => {
            const result = runExpression(resolvePath(item.expression as string, parentDataBinds), formData);

            if (result.result) {
              hasChange = true;
              // 联动结果数据和当前联动预配置的数据合并
              assignObjWidth(result, item);

              // 联动结果数据和代理对象合并
              assignObj(dataProxy, result);
            }
          });
          break;
        // 替换属性
        case 'replace':
          cascadeValue.forEach((item: ICascadeOnItem) => {
            const result = runExpression(resolvePath(item.expression as string, parentDataBinds), formData);

            if (result.result) {
              hasChange = true;
              assignObj(result, item);

              if (result.value !== undefined) {
                dataProxy.value = result.value;
              }

              if (isObject(result.wprops)) {
                dataProxy.wprops = result.wprops;
              }
            }
          });
          break;
        // 重置属性
        case 'reset':
          cascadeValue.forEach((item: ICascadeOnItem) => {
            const result = runExpression(resolvePath(item.expression as string, parentDataBinds), formData);

            if (result.result) {
              hasChange = true;
              dataProxy.value = defaultData?.value;
              dataProxy.wprops = defaultData?.wprops;
            }
          });
          break;
        // 重置属性
        case 'action':
          cascadeValue.forEach((item: ICascadeOnItem) => {
            const result = runExpression(resolvePath(item.expression as string, parentDataBinds), formData);

            if (result.result) {
              runActions(item.action as TActionsProps, options);
            }
          });
          break;
        default:
          break;
      }

      return key;
    });
  }

  return hasChange;
}

export function useRunCascader(cascadeOn: ICascadeOn) {
  const { getDataProxy, getDefaultData, getParentDataBinds, getNameIdMap, getNameMap, getFormData } = useUtils();
  const dataProxy = getDataProxy();
  const formData = getFormData();
  const defaultData = getDefaultData();
  const nameMap = getNameMap();
  const nameIdMap = getNameIdMap();
  const parentDataBinds = getParentDataBinds();

  if (dataProxy) {
    cascader(cascadeOn, { dataProxy, parentDataBinds, formData, nameMap, nameIdMap, defaultData });
  } else {
    console.warn('!!禁止在根级调用此联动方法，建议直接使用cascader');
  }
}

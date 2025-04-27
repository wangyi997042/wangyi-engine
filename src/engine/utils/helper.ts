import _get from 'lodash.get';
import _set from 'lodash.set';
import hasIn from 'lodash.hasin';
import actions from '../action';
import React from 'react';
import { IWidgetData, TPath, TComponents, IOptions, TDataProxy, IEvent, TNameMap } from '../render';
import { ITransform, TDataSource, IInitialFetch } from '../render/types';
import { StaticEffectivenessWidget } from '../render/widget';
import { isObject, arrayHasChild, lineToHump, firstUpperCase } from './tools';
import validates, { TRules } from './validates';
import {
  ObjectProps,
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
export const resolvePath = (path?: string | number | (string | number)[]): (string | number)[] => {
  if (Array.isArray(path)) {
    return [...path];
  }

  if (typeof path === 'number') {
    return [path];
  }

  const paths: any = [];

  if (typeof path === 'string') {
    path.replace(/([a-zA-Z0-9_]+)/g, (text) => paths.push(text));
  }

  return paths;
};

export function recursionData(datas: {
  nameMap: TNameMap;
  nameIdMap: TNameMap;
  data: IWidgetData;
  dataClone: IWidgetData;
  dataProxy: TDataProxy;
  paths: TPath;
  path: TPath;
}) {
  const { nameMap, nameIdMap, data, dataClone, dataProxy, path, paths } = datas;

  if ((path as string[]).length > 0) {
    const thisPath = resolvePath(paths);
    const target = _get(nameMap, thisPath);

    if (!target) {
      _set(nameMap, thisPath, { _data: data, _dataClone: dataClone, _dataProxy: dataProxy });
    } else {
      target._data = data;
      target._dataClone = dataClone;
      target._dataProxy = dataProxy;
    }
  }

  if (data.nameId) {
    _set(nameIdMap, data.nameId, { _data: data, _dataClone: dataClone, _dataProxy: dataProxy });
  }
}

export function pathsToString(paths: TPath) {
  if (Array.isArray(paths)) {
    return paths.map((item, index) => {
      if (index === 0) {
        return item;
      }
      if (+item >= 0) {
        return `[${item}]`;
      }
      if (typeof item === 'string') {
        return `.${item}`;
      }
      return '';
    }).join('')
  }

  if (typeof paths === 'string') {
    return paths;
  }

  return '';
}

const nameType = ['hump', 'uppercase', 'normal', 'middledash'];
/**
 * 解析path转成数组
 * @param {string} path
 * return {array}
 */
export const getComponent = (widget: string | undefined, components: { [key: string]: TComponents }) => {
  let component;

  if (typeof widget === 'string' && isObject(components)) {
    let i = 0;

    while (nameType[i]) {
      switch (nameType[i]) {
        case 'normal':
        case 'middledash':
          component = components[widget];
          break;
        case 'hump':
          component = components[lineToHump(widget)];
          break;
        case 'uppercase':
          component = components[firstUpperCase(widget)];
          break;
      }

      if (component) {
        return component;
      }

      i += 1;
    }
  }

  return component;
};

function makePaths(names: TPath | undefined, index: number) {
  names = resolvePath(names);

  if (+names[0] >= 0) {
    names[0] = index;
  } else {
    names.unshift(index);
  }

  return names;
}

export function addIndexToPaths(item: IWidgetData, index: number) {
  if (isObject(item)) {
    item.name = makePaths(item.name, index);
    item.dataBind = makePaths(item.dataBind, index);
  }
}

// 重构代码
export function getPath(data: IWidgetData) {
  const { dataBind } = data || {};

  return resolvePath(dataBind);
}

export function getDataFromNameIdMapOrNameMap(data: { names?: TPath, nameId?: TPath }, options: { nameMap: TNameMap; nameIdMap: TNameMap }, key?: '_data' | '_dataClone' | '_dataProxy') {
  let target = null;

  if (data.names) {
    target = _get(options.nameMap, data.names);
  }

  if (!target && data.nameId) {
    target = _get(options.nameIdMap, data.nameId);
  }

  if (target) {
    if (key) {
      return target[key];
    }
    return target;
  }

  return null;
}

export function getDataProxyFromNameMap(names: TPath, nameMap: TNameMap) {
  return _get(nameMap, names)?._dataProxy;
}

export function getDataFromNameMap(names: TPath, nameMap: TNameMap) {
  return _get(nameMap, names)?._data;
}

export function getDataCloneFromNameMap(names: TPath, nameMap: TNameMap) {
  return _get(nameMap, names)?._dataClone;
}

export function getAllDataFromNameMap(names: TPath, nameMap: TNameMap) {
  const target = _get(nameMap, names);

  return {
    _data: target._data,
    _dataClone: target._dataClone,
    _dataProxy: target._dataProxy,
  };
}

export function getValue(data?: IWidgetData) {
  const defaultValue = (isObject(data?.defaultValue) || Array.isArray(data?.defaultValue) && !Object.isFrozen(data?.defaultValue))
    ? Object.freeze(data?.defaultValue)
    : data?.defaultValue;

  if (isObject(data) && 'value' in data) {
    return data?.value;
  }

  if (Array.isArray(defaultValue)) {
    return [...defaultValue];
  }

  if (isObject(defaultValue)) {
    return { ...defaultValue };
  }

  return defaultValue;
}

export function valueIsIn(data?: IWidgetData) {
  if (isObject(data) && ('value' in data || 'defaultValue' in data)) {
    return true;
  }

  return false;
}

// 合并对象
// 合并两层，在深了不合并
// 把右侧对象的内容合并到左侧对象
export function assignObj(leftData: ObjectProps | undefined, rightData: ObjectProps | undefined) {
  if (!isObject(leftData) && !isObject(rightData)) {
    return {};
  }

  if (!isObject(leftData) && isObject(rightData)) {
    return rightData;
  }

  if (isObject(leftData) && !isObject(rightData)) {
    return leftData;
  }

  Object.keys(rightData as ObjectProps).forEach((key) => {
    if (!(key in (leftData as ObjectProps))) {
      (leftData as ObjectProps)[key] = (rightData as ObjectProps)[key];
    } else if (isObject((leftData as ObjectProps)[key]) && isObject((rightData as ObjectProps)[key])) {
      (leftData as ObjectProps)[key] = { ...(rightData as ObjectProps)[key], ...(leftData as ObjectProps)[key] };
    }
  });

  return leftData;
}

export function getComponentData(data: IWidgetData) {
  const props: { value?: any } = {};

  if (isObject(data) && 'value' in data) {
    props.value = data.value;
  }

  return props;
}

// 删除节点属性
export function deleteWprop(data: object, path: TPath) {
  const paths = resolvePath(path);
  const lastPath = paths.pop();
  const target = paths.length === 0 ? data : _get(data, paths);

  if (Array.isArray(target) && typeof lastPath === 'number' && lastPath >= 0) {
    target.splice(lastPath + 1, 1);
    return;
  }

  if (
    (Array.isArray(target) || isObject(target))
    && (
      typeof lastPath === 'string'
      || (typeof lastPath === 'number' && +lastPath >= 0)
    )
  ) {
    delete target[lastPath];
  }
}

export function runEffectivenessProps(props: any): {
  nameMap: TNameMap;
  formData: object;
  cascaderList: (() => void)[];
  options?: IOptions;
  events?: IEvent;
  nameIdMap: TNameMap;
} {
  if (isObject(props)) {
    const { nameMap = {}, formData = {}, nameIdMap = {}, cascaderList = [], ...others } = props;

    return {
      nameMap: isObject(nameMap) ? nameMap : {},
      formData: isObject(formData) ? formData : {},
      nameIdMap: isObject(nameIdMap) ? nameIdMap : {},
      cascaderList: Array.isArray(cascaderList) ? cascaderList : [],
      ...others,
    };
  }

  return {
    nameMap: {},
    formData: {},
    nameIdMap: {},
    cascaderList: [],
  };
}

// 判断对象上是否含有相应的属性
export function hasOwnPrototype(data: object, path: TPath) {
  const paths = resolvePath(path);
  const lastPath = paths.pop();
  const target = paths.length === 0 ? data : _get(data, paths);

  if (isObject(target) || Array.isArray(target)) {
    return target.hasOwnPrototype(lastPath);
  }

  return false;
}

export const dpdeTransform = (
  dvalue: any,
  { deTransform, data, promiseList }: { deTransform?: ITransform; data: IWidgetData; promiseList: Promise<any>[] }
) => {
  if (data?.transform && typeof deTransform?.[data?.transform] === 'function') {
    const result = deTransform?.[data?.transform](dvalue);

    if (Reflect.toString.call(result) === '[object Promise]') {
      promiseList.push(result);

      result.then((tvalue: any) => {
        data.value = tvalue;
      });
    } else {
      data.value = result;
    }
  } else {
    data.value = dvalue;
  }
};

export const setValueInSource = (
  initialData: object,
  { dataSource, deTransform, parentDataBinds, parentPath, onlyStaticValue, staticValueAble, update, callBack, force }: {
    dataSource: TDataSource;
    deTransform?: ITransform;
    update?: () => void;
    force?: boolean;
    staticValueAble?: boolean;
    onlyStaticValue?: boolean;
    parentDataBinds?: (string | number | undefined)[],
    parentPath?: (string | number | undefined)[],
    overlay?: boolean;
    callBack?: (
      { data, dataBind, dataBinds, promiseList }: {
        data: IWidgetData;
        dataBind: TPath;
        dataBinds: (string | number | undefined)[];
        promiseList: Promise<unknown>[];
      }
    ) => void;
  },
) => {
  const promiseList: Promise<unknown>[] = [];
  const defaultFunc = typeof callBack === 'function' ? callBack : ({ data, dataBind, dataBinds }: { data: IWidgetData; dataBind: TPath; dataBinds: (string | number | undefined)[]; }) => {
    const isTrueStaticPath = typeof data?.staticName === 'string' || Array.isArray(data?.staticName);

    if (staticValueAble && isTrueStaticPath) {
      const staticValue = _get(initialData, data?.staticName as (string | number)[]);

      dpdeTransform(staticValue, { deTransform, data, promiseList });
      return;
    }

    if (onlyStaticValue) {
      return;
    }

    if (arrayHasChild(dataBind)) {
      const valueInData = hasIn(initialData, dataBinds as (string | number)[]);
      const value = _get(initialData, dataBinds as (string | number)[]);

      if (force && valueInData) {
        dpdeTransform(value, { deTransform, data, promiseList });
        return;
      }

      if (value === undefined) {
        if ((data as IWidgetData).value === undefined) {
          data.value = (data as IWidgetData).defaultValue
        }
      } else {
        dpdeTransform(value, { deTransform, data, promiseList });
      }
    }
  }

  StaticEffectivenessWidget(
    dataSource,
    (options) => defaultFunc({ ...options, promiseList }),
    {
      parentDataBinds: parentDataBinds || [],
      parentPath: parentPath || [],
    },
  );

  update && update();

  Promise.allSettled(promiseList).then(() => {
    update && update();

    return dataSource;
  });
};

// 获取formitem中的onChange，names等字段
export function getFormItemProps(props: {
  [key: string]: any;
}, context: any) {
  const { names, onChange } = props;
  const { data, dataBinds, onChange: onContextChange } = context;
  const nextProps: {
    [key: string]: any;
    names?: Exclude<TPath, string | number>;
    onChange?: (e: Event, ...arg: any) => void;
    label?: string | TDataProxy;
    rules?: TRules,
    noStyle?: boolean;
    labelCol?: {
      span: number;
    };
    description?: TDataProxy;
    extra?: TDataProxy;
    wrapperCol?: {
      span: number;
    };
  } = {};

  // props中的names大于context中的dataBinds
  if (arrayHasChild(resolvePath(names))) {
    nextProps.names = resolvePath(names);
  } else if (arrayHasChild(getPath(data))) {
    nextProps.names = dataBinds;
  }

  if (typeof onChange === 'function') {
    nextProps.onChange = onChange;
  } else {
    nextProps.onChange = onContextChange;
  }

  if (typeof onChange === 'function') {
    nextProps.onChange = onChange;
  } else {
    nextProps.onChange = onContextChange;
  }

  ['label', 'labelCol', 'extra', 'description', 'wrapperCol', 'rules', 'noStyle'].forEach((key) => {
    if (props[key]) {
      nextProps[key] = props?.[key];
    } else {
      nextProps[key] = data?.[key];
    }
  });

  return nextProps;
}

export function getIniTialData(initialFetch: IInitialFetch, pglobalData: { [key: string]: any }) {
  return Promise.allSettled<{ key: string; result: any }[]>(Object.keys(initialFetch as any).map((key) => {
    return actions.fetch((initialFetch as any)[key]).then((result: any) => {
      return {
        key,
        result,
      };
    });
  })).then((results) => {
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        pglobalData[result.value.key] = result.value.result;
      }
    });
    return Promise.resolve(pglobalData);
  });
}

// 获取formitem中的onChange，names等字段
export function getValueFormEvent(event?: React.ChangeEvent<any>) {
  switch (event?.target?.type) {
    case 'radio':
    case 'text':
    case 'password':
      return event.target.value;
    case 'checkbox':
      return event.target.checked;
    default:
      return event;
  }
}

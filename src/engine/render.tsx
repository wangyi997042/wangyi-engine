import React from 'react';

import { onAction as globalAction } from './action';
import {
  WindowProps,
  EngineProps,
  TreeProps,
  DataMapsProps,
  DataMapValue,
  CrengineProps,
  FrameworkLifeCycles,
} from './types';
import CreateTree from './tree';
import CreateDataMaps from './dataMaps';
import interceptEvent from './utils/intercept';
import { difference, diffchange, isObject, lawTreeId, firstUpperCase } from './utils/tools';

import { cascadeOnAll } from './cascade';
import { addStore } from './store/store';
import { resolvePathForm } from './utils/helper';

export interface OptionsProps {
  components: any;
  form?: any;
  params?: any;
  cdata?: any;
  storeId?: string;
  CRE_ID?: string;
  onAction?: any;
  autoRunning?: boolean;
  [propName: string]: any;
}

export interface EventsProps {
  onChange?: (item: any, others?: any) => void;
  [propName: string]: any;
}

export interface renderOptionsProps {
  tree: TreeProps;
  dataMaps: DataMapsProps;
  options: OptionsProps;
  events: EventsProps;
}

export interface RegisterComponentProps {
  CRE_ID?: string;
  widget: string;
  _id: string;
  _crengine: any;
  $data?: any;
  $dataMaps?: any;
  [propName: string]: any;
}

export type PathProps = any[];

function crePropsDecompose(props: CrengineProps) {
  const {
    path,
    name,
    dataBind,
    form,
    params,
    paramType,
    cdata,
    childrens,
    ...oters
  } = props;

  const newProps: CrengineProps = {
    ...oters,
  };

  if (path) {
    newProps.path = path;
  }

  if (name) {
    newProps.name = name;
  }

  if (form) {
    newProps.form = form;
  }

  if (dataBind) {
    newProps.dataBind = dataBind;
  }

  if (cdata) {
    newProps.cdata = cdata;
  }

  if (params) {
    newProps.params = params;
  }

  if (paramType) {
    newProps.paramType = paramType;
  }

  if (childrens) {
    newProps.childrens = childrens;
  }

  return newProps;
}

const diffOmitList = [
  'onChange',
  'onOk',
  'children',
  '_crengine',
];

let root: any = {};

// eslint-disable-next-line
if (typeof window !== 'undefined') {
  // eslint-disable-next-line
  root = window;
}

// 调用渲染引擎次数
root.applyRenderCount = 0;

export class RegisterComponent extends React.Component<RegisterComponentProps, any> {
  shouldComponentUpdate(nextProps: RegisterComponentProps) {
    const { _crengine: _ncrengine = {}, children } = nextProps;
    const { _crengine = {} } = this.props;
    const list: string[] = difference(Object.keys(nextProps), diffOmitList);

    // has form || eq forceUpdate || children attr update || diff key name || diff value
    if (
      _ncrengine.form
      || (_ncrengine.forceUpdate && _crengine.forceUpdate !== _ncrengine.forceUpdate)
      || (children && Array.isArray(children) && children.length)
      || list.length !== difference(Object.keys(this.props), diffOmitList).length
      || diffchange(list, nextProps, this.props)
    ) {
      return true;
    }

    return false;
  }

  getComponent(): any {
    const { _crengine = {} } = this.props;
    const { widget, components } = _crengine;
    let Components = components[widget];

    // form-card transform FormCard
    if (
      !Components
      && widget
    ) {
      const names = widget.split('-') || [];
      let name = '';

      if (Array.isArray(names) && names.length) {
        names.forEach((key) => {
          name += firstUpperCase(key);
        });
      }

      Components = components[name];
    }

    return Components;
  }

  render() {
    console.log(this.props);
    const {
      // 渲染ID，保留这个版本，下一个版本删除
      // CRE_ID,
      // $data,
      $dataMaps,
      _id,
      _crengine = {},
      children,
      ...others
    } = this.props;
    const { widget } = _crengine;
    console.log(widget);
    const Components = this.getComponent();
    

    if (!Components) {
      console.error(`Compnents Name: ${widget}`);
      return null;
    }

    const componentProps = {
      // 暂时保留空对象，防止页面白屏
      // wprops: {},
      ...others,
      _id,
      _crengine,
    };

    if (children) {
      return (
        <Components
          {...componentProps}
        >
          {children}
        </Components>
      );
    }

    return (
      <Components
        {...componentProps}
      />
    );
  }
}

/**
 * 子级渲染
 * @param {object[]} childNodes  树子级
 * @param {object}   dataMaps    对应组件表 { 'xx': { "widget": "form" } }
 * @param {object}   options     配置
 * @param {object}   events      回调事件
 */
export const childsRender = (
  props: EngineProps,
  childNodes: any[],
  opts: renderOptionsProps,
  lifecycle?: FrameworkLifeCycles,
): any => {
  if (childNodes && Array.isArray(childNodes) && childNodes.length) {
    return childNodes.map((item) => {
      opts.tree = item;
      /* eslint-disable-next-line */
      return render(props, opts, lifecycle);
    });
  }

  return null;
};

/**
 * 渲染层
 * @param {object}    data       数据
 * @param {object}    opts       配置
 * @config {object}   tree       树型结构
 * @config {object}   dataMaps   对应组件表 { 'xx': { "widget": "form" } }
 * @config {object}   options    参数
 * @config {object}   events     回调事件
 * @param  {object}  lifecycle      生命周期
 */
export function render(
  data: EngineProps,
  opts: renderOptionsProps,
  lifecycle?: FrameworkLifeCycles,
) {
  const {
    tree,
    dataMaps,
    options,
    events,
  } = opts || {};
  const {
    id,
    path,
    name,
    hidden,
    childNodes,
  } = tree;

  if (hidden) {
    return null;
  }

  const mapValue: DataMapValue = dataMaps[id];
  console.log(dataMaps);
  

  if (!mapValue) {
    if (childNodes && childNodes.length) {
      return childsRender(data, childNodes, opts, lifecycle);
    }
    return null;
  }

  const {
    widget,
    dataBind,
    paramType,
    wprops,
    $childrens,
    $rootStoreId,
    ...othersMap
  } = mapValue || {};

  if (!wprops) {
    return null;
  }

  const {
    onAction,
    autoRunning = true,
    actionData,
    ...othersOption
  } = options || {};

  const crengine: CrengineProps = crePropsDecompose({
    ...othersOption,
    widget,
    path: resolvePathForm(path || ''),
    dataBind,
    name,
    paramType,
    childrens: $childrens,
    $data: data,
    $dataMaps: dataMaps,
    action: (item: any) => globalAction(item, { actionList: onAction, actionData }, lifecycle),
  });

  return (
    <RegisterComponent
      key={id}
      {...othersMap}
      // wprops属性优先，wprops.value存在问题？
      {...wprops}
      {...interceptEvent(events, { dataMaps, data, autoRunning }, lifecycle)}
      _id={id}
      _crengine={crengine}
    >
      {(childNodes && childNodes.length) ? childsRender(data, childNodes, opts, lifecycle) : null}
    </RegisterComponent>
  );
}

declare var window: WindowProps;
/**
 * 引擎渲染
 * @param {object}     data         数据
 * @param {object}     options      参数
 * @config {object}    components   组件列表
 * @config {object}    onAction     动作
 * @config {object[]}  actionData   动作需要依赖数据
 * @config {string}    storeId      数据全局ID
 * @config {boolean}   applyCount   记时数，默认为false。使用可能会数据重复生成
 * @config {boolean}   autoRunning  自动运行
 * @param  {object}    events       回调事件
 * @config {function}  onChange     回调函数
 * @param  {array}     path         name路径
 * @param  {object}    lifecycle    生命周期
 */
export function engineRender(
  data: EngineProps,
  options: OptionsProps,
  events: EventsProps,
  path?: PathProps,
  lifecycle?: FrameworkLifeCycles,
): any {
  if (!(data && Object.keys(data).length)) {
    console.warn('请传JSON数据 data');
    return null;
  }

  if (typeof window.ENGINE_BEFORE_RENDER === 'function' && (window.location.host.includes('-test') || window.location.host.includes('-uat'))) {
    try {
      data = window.ENGINE_BEFORE_RENDER(data);
    } catch (e) {
      console.log('ENGINE_BEFORE_RENDER e: ', e);
    }
  }

  const {
    components,
    form,
    storeId,
    // 兼容v2版本，后期版本删除
    CRE_ID,
    applyCount,
    autoRunning = true,
  } = options || {};

  // components undefined
  if (!components) {
    console.error('请传值参数 options.components');
    return null;
  }

  // form null
  if (!form) {
    console.warn('使用form组件必须 options.form');
  }

  let globalLifecycle: any = {};

  // 生命周期转换
  if (lifecycle && Object.keys(lifecycle).length) {
    globalLifecycle = lifecycle;
  } else if (isObject(path)) {
    globalLifecycle = path;
    path = [];
  }

  const { $rootStoreId } = data || {};
  const ONLY_ID = (storeId || CRE_ID || $rootStoreId);
  let onlyStoreId: any = (ONLY_ID || lawTreeId(data));

  // storeId 未传，自动生成
  if (!ONLY_ID) {
    // 异常重复生成
    if (applyCount) {
      root.applyRenderCount += 1;
      onlyStoreId = `${onlyStoreId}_${root.applyRenderCount}`;
    }

    // 防止数据重复
    data.$rootStoreId = onlyStoreId;
  }

  // 保存本地数据
  addStore(data, onlyStoreId);

  const tree: any = new CreateTree(data, onlyStoreId, path);
  const dataMaps: any = new CreateDataMaps(data, tree, onlyStoreId);

  // 开启运行，监听全部联动
  if (autoRunning) {
    cascadeOnAll(tree, dataMaps, tree, form);
  }

  const opts = {
    tree,
    dataMaps,
    options,
    events,
  };

  console.log(opts);
  
  return render(data, opts, globalLifecycle);
}

export default engineRender;

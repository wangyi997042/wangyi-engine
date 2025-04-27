import React, { PureComponent, useContext } from 'react';
import _get from 'lodash.get';
import _set from 'lodash.set';
import cloneDeep from 'lodash.clonedeep';
import { IDataRenderProps, TPath, TDataProxy, TEffectivenessResult, IWidgetData, IScrollConfig, IOptions, IComponentRenderProps } from './types';
import { AnalysisEngineContext, DataRenderContext } from './store';
import { getPath, resolvePath, getValue, getComponentData, deleteWprop, recursionData, getComponent } from '../utils/helper';
import { isObject, arrayHasChild, isFunction } from '../utils/tools';
import { _runAction, runActions } from '../action';
import { runExpression } from '../utils/expression';
import { resolvePath as casResolvePath } from '../cascade';
import { TActionsProps } from '../action/types';
import cascader, { ICascadeOn } from '../cascade';

import FormItem, { formItemSymble } from './formItem';
import { EffectivenessWidget } from './widget';

// 组件解析
export function ComponentRender<P, N>(props: IComponentRenderProps<P, N>): any {
  const { options, fieldProps } = useContext(AnalysisEngineContext);
  const { components } = options as IOptions;
  const { widget, children, ...componentProps } = props;
  const Component = getComponent(widget, components);

  if (typeof Component === 'undefined') {
    return children || null;
  }

  return <Component {...componentProps} {...fieldProps}>{children}</Component>;
}

export class DataRender extends PureComponent<IDataRenderProps> {
  static contextType = AnalysisEngineContext;

  // 会触发死循环
  // static getDerivedStateFromError() {
  //   return { hasError: true };
  // }

  static defaultProps = {
    index: undefined,
  };

  declare context: React.ContextType<typeof AnalysisEngineContext>

  eventProxy: { [key: string]: (e: any, options: any) => void } = {};

  state = { hasError: false };

  dataBinds: Exclude<TPath, string | number>;

  dataBind: TPath;

  paths: TPath;

  path: TPath;

  dataProxy: TDataProxy;

  cloneData: IWidgetData;

  firstMount: object;

  scrollFuncSetMap: WeakMap<object, string | undefined>;

  constructor(props: IDataRenderProps) {
    super(props);

    const { data, _parent, _parentDataBinds, index, _parentPath } = props;
    const dataBind = getPath(data);
    const dataBinds = ([] as (string | number | undefined)[]).concat(_parentDataBinds, dataBind).filter((item) => ['string', 'number'].indexOf(typeof item) >= 0);
    const path = resolvePath(data?.name);
    const paths = ([] as (string | number | undefined)[]).concat(_parentPath, path).filter((item) => ['string', 'number'].indexOf(typeof item) >= 0);
    const proxyData = {
      ...data,
      // 位于父节点子节点的哪一个位置
      index,
      _dataBinds: dataBinds,
      _paths: paths,
      _parent,
      _parentDataBinds,
      _parentPath,
      _childrens: [],
    };

    proxyData.wprops = this.createUpdataProxy(proxyData.wprops);

    // 当前节点的dataBind
    this.dataBind = dataBind;
    // 当前节点的表单路径
    this.dataBinds = (dataBinds as Exclude<TPath, string | number>);

    // 当前节点的路径key
    this.path = path;
    // 当前节点的全路径
    this.paths = (paths as (string | number)[]);
    // 当前节点的克隆数据，主要用于reset、copy等
    this.cloneData = cloneDeep(data);
    // 当前节点的代理数据、当数据改变时触发重新渲染。
    this.dataProxy = new Proxy(proxyData, {
      set: (target: any, prop: keyof typeof data, value: any) => {
        data[prop] = value;

        if (prop === 'wprops') {
          target[prop] = this.createUpdataProxy(value);
        } else {
          target[prop] = value;
        }

        if (prop === 'value') {
          this.setValue(value);
        }

        this.forceUpdate();

        return true;
      },
    });

    if (_parent) {
      _parent._childrens.push({
        resetForm: this.reset,
        target: this.dataProxy,
      });
    }

    this.scrollFuncSetMap = new WeakMap();
    this.eventProxy = {};

    // 第一次渲染的标识，因为有些场景下面，children不会立刻放入页面中，如modal、popup等组件，这时生命周期不会执行
    // 但是渲染引擎已经属于加载后的状态了，这里做一个补偿。
    this.firstMount = {};
  }

  componentDidMount() {
    const { data } = this.props;
    const { initialActions } = data;
    const { isEngineLoaded } = this.context;

    if (initialActions) {
      this.runActions(initialActions, { self: true, });
    }

    // children在渲染引擎加载完成之后放入页面的话，触发一次联动
    if (isEngineLoaded !== this.firstMount) {
      this.bindCascader();
      this.firstMount = isEngineLoaded;
    }
  }


  componentDidCatch(error: any, errorInfo: any) {
    // 后期做错误信息上报
    console.error(error);
    console.error(errorInfo);
  }

  componentWillUnmount() {
    const { data } = this.props;
    const { cascadeOn, scrollConfig } = data;
    const { cascaderList, scrollFunc } = this.context;

    if (isObject(cascadeOn)) {
      const index = cascaderList.findIndex((item: () => void) => item === this.bindCascader);

      cascaderList.splice(index, 1);
    }

    if (isObject(scrollConfig) || Array.isArray(scrollConfig)) {
      const index = scrollFunc.findIndex((item: (value: number) => void) => item === this.bindScroll);

      scrollFunc.splice(index, 1);
    }
  }

  dataChange = () => {
    const { data } = this.props;
    const { nameMap, nameIdMap, cascaderList, scrollFunc } = this.context;
    const { cascadeOn, scrollConfig } = data;

    recursionData({
      nameMap,
      nameIdMap,
      dataProxy: this.dataProxy,
      paths: this.paths,
      path: this.path,
      data,
      dataClone: this.cloneData,
    });

    if (isObject(cascadeOn)) {
      cascaderList.push(this.bindCascader);
    }

    if (isObject(scrollConfig) || Array.isArray(scrollConfig)) {
      scrollFunc.push(this.bindScroll);
    }
  };

  // wprops的代理，不用做其他
  createUpdataProxy = (data?: object) => {
    if (isObject(data)) {
      return new Proxy(data, {
        set: (target: any, prop: string | symbol, value: any) => {
          target[prop] = value;

          _set(this.props?.data?.wprops as object, prop, value);

          this.forceUpdate();

          return true;
        },
      });
    }
    return data;
  };

  setValue = (value: any) => {
    if (arrayHasChild(this.dataBind)) {
      const { formData, transform, isEngineLoaded } = this.context;
      const { data } = this.props;
      const breValue = _get(formData, this.dataBinds);

      if (isEngineLoaded !== this.firstMount) {
        if (isObject(breValue)) {
          value = { ...breValue, ...value };
        }
      }

      // 对于有转换需求的进行一次转换 根据需要，也可以不要此转换
      if (data?.transform && typeof transform?.[data?.transform] === 'function') {
        const result = transform?.[data?.transform](value);

        if (Reflect.toString.call(result) === '[object Promise]') {
          result.then((tvalue?: any) => {
            _set(formData, this.dataBinds, tvalue);
          });
        } else {
          _set(formData, this.dataBinds, result);
        }
      } else {
        _set(formData, this.dataBinds, value);
      }
    }
  };

  useActionsOptions = (options?: object) => {
    const { actions: priActions, globleData, formRef, formData, options: contextOptions, nameIdMap, nameMap, update } = this.context;
    const { _parent, index } = this.props;

    return {
      actions: priActions,
      formData,
      nameMap,
      nameIdMap,
      dataProxy: this.dataProxy,
      form: formRef,
      parent: _parent,
      globleData,
      index,
      paths: this.paths,
      update,
      options: contextOptions,
      ...options,
    };
  };

  runActions = (action: TActionsProps | undefined, options?: { [key: string]: any }) => {
    return runActions(action as TActionsProps, this.useActionsOptions(options));
  };

  bindCascader = () => {
    const { data, _parentDataBinds } = this.props;
    const { cascadeOn, } = data;
    const { formData, nameMap, nameIdMap } = this.context;
    const options = {
      formData,
      defaultData: this.cloneData,
      dataProxy: this.dataProxy,
      parentDataBinds: _parentDataBinds,
      nameMap,
      nameIdMap,
    };

    cascader(cascadeOn as ICascadeOn, options);
  };

  bindScroll = (top: number) => {
    const { data } = this.props;
    const { scrollConfig } = data;
    const runer = (scrollData?: IScrollConfig) => {
      if (isObject(scrollData)) {
        const { type, value, actions } = scrollData;

        switch (type) {
          case 'up':
            if (top > value) {
              if (this.scrollFuncSetMap.get(scrollData) !== type) {
                this.scrollFuncSetMap.set(scrollData, type);
                this.runActions(actions, { self: true, });
              }
            } else {
              this.scrollFuncSetMap.set(scrollData, undefined);
            }
            break;
          case 'down':
            if (top < value) {
              if (this.scrollFuncSetMap.get(scrollData) !== type) {
                this.scrollFuncSetMap.set(scrollData, type);
                this.runActions(actions, { self: true, });
              }
            } else {
              this.scrollFuncSetMap.set(scrollData, undefined);
            }
            break;
          default:
            break;
        }
      }
    };

    if (Array.isArray(scrollConfig)) {
      scrollConfig.forEach((item) => {
        runer(item);
      });
    } else {
      runer(scrollConfig);
    }
  };

  getEventOptions = (options: any) => {
    const { formValue, formData } = this.context;

    return {
      options,
      formData,
      formValue,
      targetData: this.dataProxy,
    };
  };

  // 组件隐藏后，对于组件影响到的表单，错误验证等重置
  reset = () => {
    const { errorObject, formData, formValue } = this.context;

    if (arrayHasChild(this.dataBind)) {
      errorObject.removeError(this.dataBinds);
      deleteWprop(formValue, this.dataBinds);
      deleteWprop(formData, this.dataBinds);
    }
  };

  // 联动监听
  onChange = (value: any, options: any) => {
    const { runCascade, events } = this.context;
    // 暂时兼容目前的组件传值方式 // 需改成value形式
    this.dataProxy.value = value;

    runCascade && runCascade();

    if (isObject(events) && typeof events.onChange === 'function') {
      events.onChange(value, this.getEventOptions(options));
    }
  };

  getEventProxy = () => {
    const { events } = this.context;

    if (isObject(events)) {
      Object.keys(events).forEach((key) => {
        if (!this.eventProxy[key]) {
          this.eventProxy[key] = (e, options) => {
            events[key](e, this.getEventOptions(options));
          };
        }
      });
    }

    return this.eventProxy;
  };

  runSubmit = (e: Event, options: any, type: string) => {
    const { events } = this.context;
    const { data } = this.props;
    const { action, preValidate } = data;

    // 如果前置验证，验证成功后执行action，否则直接执行
    if (isObject(preValidate)) {
      this.runActions({
        type: 'pre-validate',
        data: preValidate,
      }).then(() => {
        this.runActions(action, options);

        isFunction(events?.[type]) && events?.[type](e, this.getEventOptions(options));
      });
    } else {
      this.runActions(action, options);

      isFunction(events?.[type]) && events?.[type](e, this.getEventOptions(options));
    }
  };

  // 点击操作带参数
  onSubmit = (e: Event, options: any) => {
    this.runSubmit(e, options, 'onSubmit');
  };

  onClick = (e: Event, options: any) => {
    this.runSubmit(e, options, 'onClick');
  };

  onVisible = (visible: boolean, options: any) => {
    const { events } = this.context;

    if (isObject(this.dataProxy.wprops)) {
      this.dataProxy.wprops.visible = visible;
    }

    if (isObject(events) && typeof events.onVisible === 'function') {
      events.onVisible(visible, this.getEventOptions(options));
    }
  };

  actionRuner = (
    key: string,
    action: { expression: string; actions: TActionsProps; },
    options: { arguments: any[]; }
  ) => {
    const args = options.arguments;

    if (key === 'onChange') {
      this.onChange(args[0], args[1]);
    }

    const eventObj = this.getEventProxy();

    typeof eventObj[key] === 'function' && eventObj[key](args[0], args[1]);

    if (action.expression) {
      const { formData, globleData } = this.context;
      const { _parentDataBinds } = this.props;

      globleData.then((values) => {
        const result = runExpression(casResolvePath(action.expression, _parentDataBinds), formData, values);

        if (result.result) {
          this.runActions(action.actions, options);
        }
      });
    } else {
      this.runActions(action.actions, options);
    }
  };

  render() {
    const { data } = this.props;
    const { isEngineLoaded } = this.context;
    const { hasError } = this.state;
    const eventObj: { [key: string]: (...args: any) => void } = {};
    const { hidden, widget, options, eventConfig, wprops, childrens } = data;
    const names = arrayHasChild(this.dataBind) ? this.dataBinds : undefined;

    if (isEngineLoaded !== this.firstMount) {
      this.dataChange();
    }

    if (hidden) {
      const targetMap = (dataTarget: TDataProxy) => {
        dataTarget._childrens.forEach((item) => {
          item.resetForm();
          targetMap(item.target);
        });
      };
      targetMap(this.dataProxy);
      this.reset();
      return null;
    }

    // TODO 添加错误边界
    if (hasError) {
      <div>error：组件渲染错误</div>
    }

    if (isObject(eventConfig)) {
      Object.keys(eventConfig).forEach((key) => {
        if (isObject(eventConfig[key])) {
          eventObj[key] = (...args) => {
            this.actionRuner(key, eventConfig[key], { arguments: args });
          };
        }
      });
    }

    this.setValue(getValue(data));

    // 这个顺序不要动前面几个方法会改变data中的值
    const componentProps = getComponentData(data);
    const optionsProps: { [key: string]: TEffectivenessResult } = {};
    const onChange = typeof eventObj?.onChange === 'function' ? eventObj.onChange : this.onChange;

    if (options && isObject(options)) {
      Object.keys((options)).forEach((key: string) => {
        optionsProps[key] = EffectivenessWidget(options[key]);
      });
    }

    return (
      <DataRenderContext.Provider
        value={{
          dataProxy: this.dataProxy,
          dataBinds: this.dataBinds,
          paths: this.paths,
          data,
          defaultData: this.cloneData,
          onChange,
        }}
      >
        <FormItem
          names={names}
          options={{ [formItemSymble]: true }}
        >
          <ComponentRender<typeof wprops, typeof eventObj>
            defaultValue={data.defaultValue}
            names={names}
            paths={arrayHasChild(this.path) ? this.paths : undefined}
            widget={widget}
            {...wprops}
            {...optionsProps}
            {...componentProps}
            onVisible={this.onVisible}
            onChange={this.onChange}
            onClick={this.onClick}
            onSubmit={this.onSubmit}
            {...eventObj}
          >
            {EffectivenessWidget(childrens)}
          </ComponentRender>
        </FormItem>
      </DataRenderContext.Provider>
    );
  }
}

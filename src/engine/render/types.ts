import React from 'react';
import actions, { FetchProps } from '../action';
import { TActionsProps } from '../action/types';
import { IPreValidateProps } from '../preValidate';
import { ValidateUtils, TRules } from '../utils/validates';

export type TComponents = React.ComponentClass<any> | ((props?: any) => Exclude<TEffectivenessWidget, undefined>);

export interface IOptions<P = {}> {
  form?: P;
  actions?: {
    [key: string]: (data?: any) => Promise<any>;
  };
  components: {
    [key: string]: TComponents;
  };
}

export type TPath = string | number | (string | number)[];

interface ICascadeOnItem {
  expression: string;
  value?: any;
  wprops?: object;
}

export interface ICascadeOn {
  hidden?: ICascadeOnItem[];
  visible?: ICascadeOnItem[];
  update?: ICascadeOnItem[];
  replace?: ICascadeOnItem[];
  reset?: ICascadeOnItem[];
}

export interface IWpropsOptions {
  [key: string]: TDataSource;
}

interface IGrad {
  span: number;
}

export interface IScrollConfig {
  type: 'up' | 'down';
  value: number;
  actions: TActionsProps;
}

export interface IWidgetData {
  widget: string; // 组件名称
  value?: any; // 值
  defaultValue?: any; // 默认值
  name?: TPath; // 路径信息
  nameId?: string; // 组件id，唯一
  uuid?: string;
  noStyle?: boolean;
  staticName?: TPath;
  hidden?: boolean; // 组件是否渲染
  label?: string | TDataSource;
  extra?: string | TDataSource;
  description?: string | TDataSource;
  dataBind?: TPath; // 表单中的key
  cascadeOn?: ICascadeOn; // 联动数据
  childrens?: TDataSource; // 子组件数据
  action?: TActionsProps;
  preValidate?: IPreValidateProps;
  scrollConfig?: IScrollConfig;
  eventConfig?: {
    [key: string]: {
      expression: string;
      actions: TActionsProps;
    };
  };
  needFormItem?: boolean;
  rules?: TRules;
  options?: IWpropsOptions;
  initialActions?: TActionsProps;
  transform?: 'string',
  labelCol?: IGrad;
  wrapperCol?: IGrad;
  wprops?: {
    [key: string]: any;
  };
}

export type TDataSource = IWidgetData | IWidgetData[];

export interface IEventOptions {
  formData: object;
  targetData: IWidgetData;
}

export interface IFormItem {
  options: { [key: symbol]: boolean };
  children: React.ReactElement;
  names?: TPath;
}

export interface IContextBoxProps {
  data: IWidgetData;
  index?: number;
}

export interface IEvent {
  [key: string]: (...arg: any) => any;
  onChange: (value: any, options: IEventOptions & { [key: string]: any }) => void;
  onSubmit: (targetData: IWidgetData, formData: object) => void;
}

export type TDataProxy = IWidgetData & {
  index: number;
  _dataBinds?: TPath;
  _paths?: TPath;
  _parent: TDataProxy;
  _parentDataBinds?: TPath;
  _parentPath?: TPath;
  _childrens: [{
    resetForm: () => void;
    target: TDataProxy;
  }];
};

export interface ITransform {
  [key: string]: (value: any) => Promise<any> | any,
}

export interface TNameMap {
  [key: (string | number)]: ({
    _data: IWidgetData;
    _dataProxy: IWidgetData;
    _dataClone: IWidgetData;
  } & { [key: (string | number)]: TNameMap });
};

export interface IFormRef {
  setFormData: (data: object) => void;
  setFieldsValue: (data: object) => void;
  setFormWithData: (data: object) => void;
  setStaticData: (data: object) => void;
  validateFields: (names?: TPath[]) => Promise<any>;
  resetFields: (names?: TPath[]) => void;
  getFieldValue: (name: TPath) => any;
  getFormData: () => object;
  getFieldsValue: (names?: TPath[]) => any;
  validateScrollToError: (names?: TPath[], options?: { compensate?: number }) => Promise<any>;
  setInitialFormData: (data: object, dataSource?: TDataSource) => any;
};

type TFormRef = React.MutableRefObject<IFormRef | null>

interface ILifeCycleProps { formData?: object; nameMap: TNameMap; cascaderList: (() => void)[]; };

export interface IInitialFetch {
  [key: string]: FetchProps;
};
interface SAnalysisEngine<P> {
  options?: IOptions;
  dataSource: TDataSource;
  embed?: P;
  type?: 'pc' | 'app',
  children?: TEffectivenessResult;
  events?: IEvent;
  fieldProps?: object;
  localReuse?: boolean;
  transform?: ITransform;
  deTransform?: ITransform;
  nameMap?: TNameMap;
  nameIdMap?: TNameMap;
  engineRef?: TFormRef;
  cascaderList?: (() => void)[];
  scrollFunc?: (() => void)[];
  formData?: object;
  globleData?: { [key: string]: any };
  globalData?: { [key: string]: any };
  initialFetch?: IInitialFetch;
  lifeCycle?: {
    willRender?: (object: ILifeCycleProps) => void;
    afterRender?: (object: ILifeCycleProps) => void;
  },
}

// AnalysisEngine props的传参
export type IAnalysisEngine = (SAnalysisEngine<false> & { options: IOptions; }) | (SAnalysisEngine<true> & { embed: true; });

export interface IAnalysisEngineContext {
  dataSource?: TDataSource;
  formData: object;
  options?: IOptions;
  events?: IEvent;
  formValue: object;
  type: 'pc' | 'app'
  update?: () => void;
  actions?: typeof actions;
  cascaderList: (() => void)[];
  runCascade?: () => void;
  fieldProps?: object;
  globleData: Promise<object>;
  propItemRender?: (data: TDataSource) => React.ReactElement;
  nameMap: TNameMap;
  nameIdMap: TNameMap;
  inEngine: boolean;
  errorObject: InstanceType<typeof ValidateUtils>;
  transform?: ITransform;
  deTransform?: ITransform;
  formRef: IFormRef;
  scrollFunc: ((value: number) => void)[];
  isEngineLoaded: object;
  formMoment: object;
  formWithMoment: object;
  staticDataMoment: object;
  initialFormDataMoment: object;
}

export interface IScrollProps {
  scrollFunc: ((value: number) => void)[];
}

export type IComponentRenderProps<P, N> = {
  defaultValue?: any;
  value?: any;
  names?: TPath;
  paths?: TPath;
  widget?: string;
  children?: TEffectivenessResult;
  onChange?: (value: any, options: { [key: string]: any }) => void;
  onClick?: (value: any, options: { [key: string]: any }) => void;
  onSubmit?: (value: any, options: { [key: string]: any }) => void;
} & (P | N)


export interface IDataRenderProps {
  index?: number;
  data: IWidgetData;
  _parent?: TDataProxy;
  _parentDataBinds?: TPath;
  _parentPath?: TPath;
}

export type TEffectivenessWidget = React.ReactElement<TDataSource> | null;
export type TEffectivenessWidgetArray = TEffectivenessWidget[];
export type TEffectivenessResult = TEffectivenessWidget | TEffectivenessWidgetArray;

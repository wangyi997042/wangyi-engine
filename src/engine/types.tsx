export interface WindowProps extends Window {
  CRE_DATA: any;
  CRE_ACTION: any;
  __wxjs_environment: any;
  wx: any;
  ENGINE_BEFORE_RENDER: (args: any) => any;
}

export interface CascadeOnTypeProps {
  hidden?: string;
  visible?: string;
  update?: any;
  replace?: any;
  reset?: any;
  rules?: any;
  arrayPos?: { index: number };
}

export interface CascadeOnProps {
  _default: CascadeOnTypeProps;
  [propName: string]: CascadeOnTypeProps;
}

export interface CascadeSyncProps {
  update: {
    name: string;
    props: string[];
  }
}

export interface EngineProps {
  _id?: string;
  widget?: string;
  defaultValue?: any;
  value?: any;
  name?: undefined | string;
  dataBind?: undefined | string;
  hidden?: boolean;
  paramType?: string;
  wprops?: any;
  cascadeOn?: CascadeOnProps;
  cascadeSync?: CascadeSyncProps;
  hideChildren?: boolean;
  childrens?: any;
  // 记录数据唯一值
  $rootStoreId?: string;
}

export interface MethodProps {
  [propName: string]: (item?: any) => void;
}

export interface ObjectProps {
  [propName: string]: any;
}

// 渲染属性
export interface CrengineProps {
  [propName: string]: any;
}

export interface TreeProps {
  id: string;
  path?: any[];
  name?: string;
  hidden?: boolean;
  cascadeOn?: CascadeOnProps;
  hideChild?: boolean;
  childNodes?: any[];
}

export interface DataComponentMap {
  widget: string;
  wprops: any;
  dataBind?: string;
  defaultValue?: any;
  value?: any;
}

export interface DataMapsProps {
  [propName: string]: DataComponentMap;
}

export interface DataMapValue {
  widget?: string;
  wprops?: any;
  path?: any[];
  paramType?: string;
  dataBind?: string;
  defaultValue?: any;
  value?: any;
  $childrens?: any[];
  $rootStoreId?: string;
}

// 链接
export interface UrlProps {
  url: string;
  // download
  name?: string;
  params?: string;
  type?: string;
  // form
  method?: string;
  acceptCharset?: string;
}

export interface DataProps {
  widget: string;
  value?: any;
  name?: string;
  dataBind?: string;
  wprops?: any;
  childrens?: any;
  [propName: string]: any;
}

export type LifeCyclesFn = (data: any, item?: any) => void;
export interface FrameworkLifeCycles {
  afterEvent?: LifeCyclesFn,
  beforeAction?: LifeCyclesFn,
  afterAction?: LifeCyclesFn,
}

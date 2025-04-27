import ActionConfig from './index';
import { IFormRef, TNameMap, IOptions, IWidgetData, TDataProxy, TPath } from '../render/types';

export interface ActionProps {
  type: string;
  data?: any;
  key?: string;
  envKey?: string;
  resolve?: TActionsProps;
  reject?: TActionsProps;
}

export type TActionsProps = ActionProps | ActionProps[]

export interface TActionOptions {
  nameMap: TNameMap;
  nameIdMap: TNameMap;
  result: object;
  self?: boolean;
  dataProxy?: TDataProxy;
}

export interface FetchProps {
  url: string;
  method?: any;
  // 兼容旧版本
  type?: string;
  data?: any;
  needFormData?: boolean;
  isLoading?: boolean;
  toastMessage?: boolean;
  isUrlParam?: boolean;
  onLog?: (props: any, value?: any) => void;
}

export type ActionCallabck = (data?: any) => void | undefined;

export interface IActionOption {
  actions?: typeof ActionConfig;
  formData?: object;
  nameMap?: TNameMap;
  nameIdMap?: TNameMap;
  arguments?: any[];
  callback?: () => void;
  globleData?: Promise<object>;
  parent?: IWidgetData;
  index?: number;
  options?: IOptions<any>;
  form?: IFormRef;
  actionEvn?: object;
  result?: object;
  paths?: TPath;
  dataProxy?: TDataProxy;
  update?: () => void;
}
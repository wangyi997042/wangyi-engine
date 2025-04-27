import React, { createContext, useContext, useRef } from 'react';
import { TPath, IWidgetData, IEventOptions, TDataProxy, IAnalysisEngineContext, IOptions } from './types';
import actions from '../action';
import { ValidateUtils } from '../utils/validates';
import { isMobile } from '../utils/tools';

let root: any = {};

if (typeof window !== 'undefined') {
  root = window;
}

if (!root._crengine_datarender_context) {
  root._crengine_datarender_context = createContext({});
}

if (!root._crengine_analys_context) {
  root._crengine_analys_context = createContext<IAnalysisEngineContext>({
    inEngine: false,
    actions,
    formValue: {},
    globleData: Promise.resolve({}),
    type: isMobile ? 'app' : 'pc',
    cascaderList: [],
    formData: {},
    scrollFunc: [],
    nameMap: {},
    nameIdMap: {},
    errorObject: new ValidateUtils(),
    formRef: {
      setFormData: (data: object) => undefined,
      setFieldsValue: (data: object) => undefined,
      setFormWithData: (data: object) => undefined,
      setStaticData: (data: object) => undefined,
      validateFields: () => Promise.resolve(),
      getFormData: () => ({}),
      setInitialFormData: (data: object) => undefined,
      resetFields: (names?: TPath[]) => undefined,
      getFieldValue: (name: TPath) => undefined,
      getFieldsValue: () => ({}),
      validateScrollToError: () => Promise.resolve(),
    },
    // runEventList: [],
    // runPromiseEvent: () => undefined,
    isEngineLoaded: {
      current: false,
    },
    formMoment: {
      current: false,
    },
    formWithMoment: {
      current: false,
    },
    initialFormDataMoment: {
      current: false,
    },
    staticDataMoment: {
      current: false,
    },
  });
}

export interface IDataRenderContext {
  dataBinds?: TPath;
  paths?: TPath;
  data?: IWidgetData;
  defaultData?: IWidgetData;
  dataProxy?: TDataProxy;
  onChange?: (value: any, options: IEventOptions & { [key: string]: any }) => void;
}

export const DataRenderContext: React.Context<IDataRenderContext> = root._crengine_datarender_context;

export const AnalysisEngineContext: React.Context<IAnalysisEngineContext> = root._crengine_analys_context;

export function useUtils() {
  const { dataProxy, defaultData } = useContext(DataRenderContext);
  const { formData, nameMap, options, nameIdMap, formRef, globleData, runCascade, inEngine } = useContext(AnalysisEngineContext);
  const getDataProxy = () => {
    return dataProxy;
  };
  const getFormData = () => {
    return formData;
  };
  const getDefaultData = () => {
    return defaultData;
  };
  const getOptions: <P>() => IOptions<P> = () => {
    return options as any;
  };
  const getNameMap = () => {
    return nameMap;
  };
  const getNameIdMap = () => {
    return nameIdMap;
  };
  const getParentDataBinds = () => {
    return dataProxy?._parentDataBinds;
  };
  const getGlobleData = () => {
    return globleData;
  };

  return {
    getDataProxy,
    getFormData,
    getGlobleData,
    getNameIdMap,
    getNameMap,
    getDefaultData,
    getParentDataBinds,
    getOptions,
    inEngine,
    formRef,
    runAllCascade: runCascade,
  };
}

export function useForm() {
  const ref = useRef({
    getFormData: () => ({}),
    getFieldsValue: () => ({}),
    setFieldsValue: (data: object) => undefined,
    setFormData: (data: object) => undefined,
    setInitialFormData: (data: object, dataSource?: any) => undefined,
    setFormWithData: (data: object) => undefined,
    setStaticData: (data: object) => undefined,
    validateFields: () => Promise.resolve(),
    resetFields: (names?: TPath[]) => undefined,
    getFieldValue: (name: TPath) => undefined,
    validateScrollToError: () => Promise.resolve(),
  });

  return ref;
}

export function useUtilsData() {
  const { dataProxy, defaultData } = useContext(DataRenderContext);
  const { actions: priActions, globleData, nameIdMap, formRef, formData, options: contextOptions, nameMap, update } = useContext(AnalysisEngineContext);
  const { _parent, _paths } = dataProxy || {};

  return {
    actions: priActions,
    formData,
    nameMap,
    nameIdMap,
    paths: _paths,
    parent: _parent,
    form: formRef,
    dataProxy,
    defaultData,
    parentDataBinds: dataProxy?._parentDataBinds,
    globleData,
    update,
    options: contextOptions,
  };
}

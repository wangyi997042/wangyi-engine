import React, { PureComponent, useContext } from 'react';
import { isObject, isMobile } from './utils/tools';
import { ValidateUtils } from './utils/validates';
import { Cell } from './components';
import {
  AnalysisEngineContext,
  ComponentRender,
  IAnalysisEngine,
  IWidgetData,
  TPath,
  TDataSource,
  TEffectivenessResult,
} from './render';

type TStaticAnalysisEngine = IAnalysisEngine & {
  dataSource: IWidgetData;
  propItemRender?: (data: TDataSource) => React.ReactElement;
};

class DataRender extends PureComponent<{ children?: TEffectivenessResult, data: IWidgetData; index?: number }> {
  static contextType = AnalysisEngineContext;

  declare context: React.ContextType<typeof AnalysisEngineContext>

  render() {
    const { data, children } = this.props;
    const { hidden, widget, wprops, extra, needFormItem, description, rules, labelCol, wrapperCol, label, noStyle } = data;
    const { type } = this.context;
    const cellProps = {
      required: !!rules,
      type,
      labelCol,
      wrapperCol,
      label,
      description,
      extra,
      noStyle,
    };

    if (hidden) {
      return null;
    }

    const cellChildren = (
      <ComponentRender
        value={data.value}
        defaultValue={data.defaultValue}
        widget={widget}
        {...wprops}
      >
        {children}
      </ComponentRender>
    );

    return (
      needFormItem
        ? (
          <Cell {...cellProps}>
            {cellChildren}
          </Cell>
        )
        : (cellChildren)
    );
  }
}

/**
 * 静态引擎渲染
 * 此方法主要用来劫持组件中使用的渲染引擎，配合low code平台使用
 */
export default function HijackAnalysisEngine(props: TStaticAnalysisEngine) {
  const { dataSource, fieldProps, type = 'app', options, propItemRender, children } = props;
  const defaultType = (isMobile ? 'app' : 'pc');
  const parentData = useContext(AnalysisEngineContext);
  const theType = ['app', 'pc'].indexOf((type || parentData.type)) >= 0
    ? (type || parentData.type)
    : defaultType;

  // components undefined
  if (!isObject(options)) {
    console.error('options为必填项1');
    return null;
  }

  if (!isObject(options?.components)) {
    console.error('options.components为必填项1');
    return null;
  }

  return (
    <AnalysisEngineContext.Provider
      value={{
        dataSource,
        options,
        nameMap: {},
        nameIdMap: {},
        inEngine: true,
        propItemRender,
        formData: {},
        formValue: {},
        scrollFunc: [],
        type: theType,
        fieldProps,
        cascaderList: [],
        globleData: Promise.resolve({}),
        formMoment: { current: {} },
        formWithMoment: { current: {} },
        staticDataMoment: { current: {} },
        initialFormDataMoment: { current: {} },
        errorObject: new ValidateUtils(),
        formRef: {
          getFormData: () => ({}),
          getFieldsValue: () => ({}),
          setFieldsValue: (data: object) => undefined,
          setFormData: (data: object) => undefined,
          setInitialFormData: (data: object, dataSource?: TDataSource) => undefined,
          setFormWithData: (data: object) => undefined,
          setStaticData: (data: object) => undefined,
          validateFields: () => Promise.resolve(),
          resetFields: (names?: TPath[]) => undefined,
          getFieldValue: (name: TPath) => undefined,
          validateScrollToError: () => Promise.resolve(),
        },
        isEngineLoaded: {
          current: true,
        }
      }}
    >
      <DataRender data={dataSource}>
        {children}
      </DataRender>
    </AnalysisEngineContext.Provider>
  );
}

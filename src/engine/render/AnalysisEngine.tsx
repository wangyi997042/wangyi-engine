import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import _get from 'lodash.get';
import _set from 'lodash.set';
import { IAnalysisEngine } from './types';
import { DataRenderContext, AnalysisEngineContext } from './store';
import actions from '../action';
import Scroll from './scroll';
import { EffectivenessWidget } from './widget';
import useSubScription from './hooks/useSubScription';
import useEffectivenessProps from './hooks/useEffectivenessProps';
import useDataRender from './hooks/useDataRender';
import useEngineReload from './hooks/useEngineReload';
import useFormError from './hooks/useFormError';
import useFormFcun from './hooks/useFormFunc';
import useFormValue from './hooks/useFormValue';
import { isObject, isFunction, isMobile } from '../utils/tools';
import { getIniTialData } from '../utils/helper';

/**
 * 引擎渲染
 * @param {object}     data         数据
 * @param {object}     options      参数
 * @param  {object}    events       回调事件
 * @param  {array}     path         name路径
 * @param  {object}    lifecycle    生命周期
 */
export default function AnalysisEngine(props: IAnalysisEngine): React.ReactElement | null {
  const {
    type,             // 渲染对象是PC还是APP
    transform,
    deTransform,
    globleData,
    globalData: pglobalData = {},
    localReuse,
    dataSource,
    initialFetch,
    children,
    lifeCycle,
    engineRef
  } = props;
  const parentData = useContext(AnalysisEngineContext);
  const waitInitialFetch = isObject(initialFetch) && Object.keys(initialFetch).length > 0;
  const globalData = useRef(waitInitialFetch
    ? getIniTialData(initialFetch, pglobalData)
    : Promise.resolve((globleData || pglobalData))
  );
  let { embed = false } = props;

  if (!parentData.inEngine) {
    if (embed) {
      console.error('内嵌组件必须包含在非内嵌组件内');
    }
    embed = false;
  }

  const formValue = useFormValue({ dataSource, embed, localReuse });
  const errorObject = useFormError({ dataSource, embed, localReuse });
  const parentText = useDataRender({ embed, localReuse });
  const [isEngineLoaded, update] = useEngineReload({
    dataSource,
    embed,
    localReuse,
  }); // 引擎加载标志 原来的moment改成 isEngineLoaded
  const { options, fieldProps, nameMap, nameIdMap, formData, scrollFunc, cascaderList, events } = useEffectivenessProps(props);
  const [formRef, {
    initialFormDataMoment,
    formMoment,
    staticDataMoment,
    formWithMoment,
  }] = useFormFcun({
    dataSource,
    update,
    deTransform,
    parentText,
    errorObject,
    formValue,
    embed,
    formData,
    localReuse,
  });
  const runCascade = useCallback(() => {
    cascaderList && Array.isArray(cascaderList) && cascaderList.length > 0 && cascaderList.forEach((func: () => void) => {
      typeof func === 'function' && func();
    });
  }, [cascaderList]);
  const endLisf = () => {
    runCascade();
  };
  const defaultType = (isMobile ? 'app' : 'pc');
  const theType = ['app', 'pc'].indexOf((type || parentData.type)) >= 0
    ? (type || parentData.type)
    : defaultType;

  if (isFunction(lifeCycle?.willRender)) {
    lifeCycle?.willRender?.({ formData, nameMap, cascaderList });
  }

  useEffect(() => {
    endLisf();

    errorObject.firstMount = false;

    if (lifeCycle && isFunction(lifeCycle?.afterRender)) {
      lifeCycle.afterRender?.({ formData, nameMap, cascaderList });
    }
  });

  if (engineRef && isObject(engineRef)) {
    if (isObject(engineRef.current)) {
      Object.assign(engineRef.current, formRef);
    } else {
      engineRef.current = formRef;
    }
  }

  const providerValue = useMemo(() => {
    return ({
      dataSource,
      formData,
      options,
      events,
      // 引擎渲染的标志
      inEngine: true,
      // 所有的事件
      actions: { ...actions, ...options?.actions },
      // 记录的联动列表
      cascaderList,
      // 执行联动的方法
      runCascade,
      nameMap,
      nameIdMap,
      scrollFunc, // 滚动时间集合
      // 全局数据，一般用于action，比如多个action公用一份数据
      globleData: globalData.current,
      update,
      // 会透传给组件
      fieldProps,
      // 引擎加载标志
      isEngineLoaded,
      // form数据设置标志
      formMoment: formMoment.current,
      // form数据合并defaultValue设置标志
      formWithMoment: formWithMoment.current,
      // 对于设置了staticName的节点从此对象中取值
      staticDataMoment: staticDataMoment.current,
      // 只有使用FormItem组件包裹的节点才会同步value到formValue中
      initialFormDataMoment: initialFormDataMoment.current,
      formValue,
      errorObject,
      type: theType,
      transform,
      formRef,
      deTransform,
    });
  }, [
    options,
    nameMap,
    nameIdMap,
    formData,
    cascaderList,
    events,
    isEngineLoaded,
    errorObject,
    formValue,
    formRef,
    deTransform,
    transform,
    theType,
    formMoment.current,
    formWithMoment.current,
    staticDataMoment.current,
    initialFormDataMoment.current,
    update,
    scrollFunc,
    options?.actions,
    dataSource,
    fieldProps,
    runCascade,

    globalData.current
  ]);

  // 需要劫持组件内调用的AnalysisEngine时加propItemRender
  if (parentData.propItemRender && isFunction(parentData.propItemRender)) {
    return parentData.propItemRender(dataSource);
  }

  // 子节点监听设置表单事件
  useSubScription({
    embed,
    formMoment,
    formWithMoment,
    staticDataMoment,
    initialFormDataMoment,
    setInitialFormData: formRef.setInitialFormData,
    setFormData: formRef.setFormData,
    setFormWithData: formRef.setFormWithData,
    setStaticData: formRef.setStaticData,
  });

  // components undefined
  if (!isObject(options) && !embed) {
    console.error('AnalysisEngine 的options为必填项');
    return null;
  }
  if (!isObject(options?.components)) {
    console.error('AnalysisEngine 中options.components为必填项');
    return null;
  }

  const sourceRenderResult = useMemo(() => EffectivenessWidget(dataSource), [dataSource, isEngineLoaded]);

  return (
    <AnalysisEngineContext.Provider
      value={providerValue}
    >
      <DataRenderContext.Provider
        value={parentText}
      >
        {sourceRenderResult}
        {children}
        {!embed && <Scroll scrollFunc={scrollFunc} />}
      </DataRenderContext.Provider>
    </AnalysisEngineContext.Provider>
  );
}


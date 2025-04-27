import { useMemo, useContext } from 'react';
import { isObject } from '../../utils/tools';
import _set from 'lodash.set';
import { AnalysisEngineContext, DataRenderContext } from '../store';
import { IEvent, TNameMap, IOptions, TDataSource } from '../';

export default function useSubScription(props: {
  nameMap?: TNameMap;
  formData?: object;
  cascaderList?: (() => void)[];
  scrollFunc?: (() => void)[];
  options?: IOptions;
  events?: IEvent;
  embed?: boolean;
  localReuse?: boolean;
  nameIdMap?: TNameMap;
  dataSource: TDataSource;
  fieldProps?: object;
}) {
  const parentText = useContext(DataRenderContext);
  const parentData = useContext(AnalysisEngineContext);
  const { nameMap, formData, localReuse, fieldProps, dataSource, scrollFunc, nameIdMap, embed, cascaderList, options, events } = props || {};
  const nameMapRef = useMemo(() => {
    const newNameMap = (isObject(nameMap) ? nameMap : {});

    if (embed && !localReuse) {
      if (Array.isArray(parentText.paths) && parentText.paths.length > 0) {
        _set(parentData.nameMap, parentText.paths, newNameMap);
      }

      return parentData.nameMap;
    }

    return newNameMap;
  }, [nameMap, localReuse, embed, dataSource]);
  const formDataRef = useMemo(() => {
    if (embed && !localReuse) {
      return parentData.formData;
    }

    return isObject(formData) ? formData : {};
  }, [formData, localReuse, embed]);
  const nameIdMapRef = useMemo(() => {
    if (embed && !localReuse) {
      return parentData.nameIdMap;
    }

    return isObject(nameIdMap) ? nameIdMap : {};
  }, [nameIdMap, localReuse, embed]);
  const cascaderListRef = useMemo(() => {
    if (embed && !localReuse) {
      return parentData.cascaderList;
    }

    return Array.isArray(cascaderList) ? cascaderList : [];
  }, [cascaderList, localReuse, embed]);
  const scrollFuncRef = useMemo(() => {
    if (embed && !localReuse) {
      return parentData.scrollFunc;
    }

    return Array.isArray(scrollFunc) ? scrollFunc : [];
  }, [cascaderList, localReuse, embed]);
  const optionsRef = useMemo(() => {
    if (embed) {
      return Object.assign(options || {}, parentData.options);
    }
    return options;
  }, [options, parentData.options, embed]);
  const eventsRef = useMemo(() => {
    if (embed) {
      return Object.assign(events || {}, parentData.events);
    }

    return events;
  }, [events, parentData.events, embed]);
  const fieldPropsRef = useMemo(() => {
    if (embed && !localReuse) {
      return { ...parentData.fieldProps, ...fieldProps };
    }

    return fieldProps;
  }, [fieldProps]);

  return {
    nameMap: nameMapRef,
    formData: formDataRef,
    nameIdMap: nameIdMapRef,
    cascaderList: cascaderListRef,
    scrollFunc: scrollFuncRef,
    options: optionsRef,
    events: eventsRef,
    fieldProps: fieldPropsRef,
  };
}
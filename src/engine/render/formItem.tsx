import React, { useContext, useEffect, useRef } from 'react';
import _set from 'lodash.set';
import { DataRenderContext, AnalysisEngineContext } from './store';
import { Cell } from '../components';
import { getValueFormEvent, getFormItemProps, valueIsIn, getValue } from '../utils/helper';
import { arrayHasChild, isObject } from '../utils/tools';
import { IFormItem } from './types';
import { TPath } from '../render/types';

export const formItemSymble = Symbol('formitem');

function cloneChildren(children: ((props: object) => React.ReactNode) | React.ReactElement, props: object): any {
  if (typeof children === 'function') {
    return children(props);
  }

  if (isObject(children)) {
    return React.cloneElement(children, props);
  }

  return children;
}

export default function FormItem(props: IFormItem) {
  const { options, children } = props;

  const { formValue, errorObject, inEngine, transform, type } = useContext(AnalysisEngineContext);
  const context = useContext(DataRenderContext);
  const { data } = context;
  const ref = useRef();
  const { onChange, names, label, description, extra, rules, labelCol, noStyle, wrapperCol } = getFormItemProps(props, context);
  const value = getValue(data);
  const help = errorObject.valitate({
    names,
    rules,
    value,
    ref,
  });
  const onValueVhange = (e: React.ChangeEvent<any> | undefined, ...arg: any) => {
    const evalue = getValueFormEvent(e);
    errorObject.setFirstMount(names);

    onChange && onChange(
      evalue,
      ...arg
    );
  };
  const propsOptions = {
    onChange: onValueVhange,
    status: help ? 'error' : undefined,
  };

  if (valueIsIn(data)) {
    (propsOptions as typeof propsOptions & { value?: any }).value = value;
  }

  if (
    (data?.needFormItem && options?.[formItemSymble])
    || (!data?.needFormItem && !options?.[formItemSymble])
  ) {
    const cellProps = {
      required: !!rules,
      forwardRef: ref,
      help,
      type,
      extra,
      labelCol,
      wrapperCol,
      description,
      label,
      noStyle,
    };

    if (!inEngine) {
      return (
        <Cell {...cellProps}>
          {children}
        </Cell>
      );
    }

    if (arrayHasChild(names)) {
      if (data?.transform && typeof transform?.[data?.transform] === 'function') {
        const result = transform[data.transform](value);

        if (Reflect.toString.call(result) === '[object Promise]') {
          result.then((tvalue: any) => {
            _set(formValue, names as TPath, tvalue);
          });
        } else {
          _set(formValue, names as TPath, result);
        }
      } else {
        _set(formValue, names as TPath, value);
      }
    }

    return (
      <Cell {...cellProps}>
        {
          cloneChildren(
            children,
            propsOptions
          )
        }
      </Cell>
    );
  }

  return cloneChildren(
    children,
    propsOptions
  );
}
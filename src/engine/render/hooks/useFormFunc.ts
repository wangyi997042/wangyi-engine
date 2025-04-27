import _get from 'lodash.get';
import _set from 'lodash.set';
import { useCallback, useMemo, useContext, useRef } from 'react';
import { setValueInSource, deleteWprop } from '../../utils/helper';
import { TDataSource, ITransform, TPath, IFormRef } from '../types';
import { IDataRenderContext, AnalysisEngineContext } from '../store';
import { ValidateUtils } from '../../utils/validates';
import { arrayHasChild } from '../../utils/tools';

export default function useFormFcun({
  dataSource,
  update,
  deTransform,
  parentText,
  errorObject,
  formValue,
  embed,
  localReuse,
  formData,
}: {
  dataSource: TDataSource;
  update: () => void;
  deTransform?: ITransform;
  parentText: IDataRenderContext;
  errorObject: ValidateUtils;
  formValue: object;
  embed: boolean;
  formData: object;
  localReuse?: boolean;
}): [IFormRef, {
  formMoment: React.MutableRefObject<object>;
  formWithMoment: React.MutableRefObject<object>;
  staticDataMoment: React.MutableRefObject<object>;
  initialFormDataMoment: React.MutableRefObject<object>;
}] {
  const parentData = useContext(AnalysisEngineContext);
  const formMoment: React.MutableRefObject<object> = useRef({}); // form数据设置标志
  const formWithMoment: React.MutableRefObject<object> = useRef({});
  const staticDataMoment: React.MutableRefObject<object> = useRef({});
  const initialFormDataMoment: React.MutableRefObject<object> = useRef({});

  if (embed && !localReuse) {
    formMoment.current = parentData.formMoment;
    formWithMoment.current = parentData.formWithMoment;
    staticDataMoment.current = parentData.staticDataMoment;
    initialFormDataMoment.current = parentData.initialFormDataMoment;

    return [parentData.formRef, {
      initialFormDataMoment,
      formMoment,
      staticDataMoment,
      formWithMoment,
    }];
  }

  const setInitialFormData = useCallback((initialData: object, source?: TDataSource) => {
    setValueInSource(initialData, {
      dataSource: source || dataSource,
      update,
      deTransform,
      staticValueAble: true,
      parentDataBinds: (parentText.dataBinds as (string | number | undefined)[]),
      parentPath: (parentText.paths as (string | number | undefined)[]),
    });
    initialFormDataMoment.current = initialData;
  }, [dataSource, update, deTransform, parentText.dataBinds, parentText.paths]);

  const setFormData = useCallback((data: object) => {
    setValueInSource(data, {
      dataSource,
      update,
      force: true,
      deTransform,
      parentDataBinds: (parentText.dataBinds as (string | number | undefined)[]),
      parentPath: (parentText.paths as (string | number | undefined)[]),
    });
    formMoment.current = data;
  }, [dataSource, update, deTransform, parentText.dataBinds, parentText.paths]);

  const setFormWithData = useCallback((data: object) => {
    setValueInSource(data, {
      dataSource,
      update,
      deTransform,
      parentDataBinds: (parentText.dataBinds as (string | number | undefined)[]),
      parentPath: (parentText.paths as (string | number | undefined)[]),
    });
    formWithMoment.current = data;
  }, [dataSource, update, deTransform, parentText.dataBinds, parentText.paths]);

  const setStaticData = useCallback((data: object) => {
    setValueInSource(data, {
      dataSource,
      update,
      deTransform,
      staticValueAble: true,
      onlyStaticValue: true,
      parentDataBinds: (parentText.dataBinds as (string | number | undefined)[]),
      parentPath: (parentText.paths as (string | number | undefined)[]),
    });
    staticDataMoment.current = data;
  }, [dataSource, update, deTransform, parentText.dataBinds, parentText.paths]);

  const validateFields = useCallback((names?: TPath[]) => {
    if (arrayHasChild(names)) {
      errorObject.setErrorMoment(names as TPath[]);
    } else {
      errorObject.firstMount = true;
    }

    const values = formValue;

    return new Promise((resolve, reject) => {
      if (errorObject.hasErrors(names)) {
        reject(errorObject.getAllError());
      } else {
        resolve(values);
      }

      update();
    })
  }, []);

  const resetFields = useCallback((names?: TPath[]) => {
    errorObject.resetError(names);

    if (Array.isArray(names)) {
      names.forEach((name) => {
        deleteWprop(formData, name);
      });

      setFormWithData(formData);
    } else {
      setFormWithData({});
    }
  }, [formData, setFormWithData, errorObject]);

  const getFieldValue = useCallback((name: TPath) => {
    if (arrayHasChild(name)) {
      return _get(formValue, name);
    }
    return undefined;
  }, [formValue]);

  const getFieldsValue = useCallback((names?: TPath[]) => {
    if (arrayHasChild(names)) {
      const values = {};

      names?.forEach((name) => {
        _set(values, name, _get(formValue, name));
      });

      return values;
    }

    return formValue;
  }, [formValue]);

  const getFormData = useCallback(() => {
    return formData;
  }, [formData]);

  const validateScrollToError = useCallback((names?: TPath[], { compensate }: { compensate?: number } = {}) => {
    return validateFields(names)
      .catch((errorInfo) => {
        if (Array.isArray(errorInfo) && errorInfo.length > 0) {
          const firstErrRef = errorObject.getErrorRef(errorInfo[0]?.names);

          if (firstErrRef?.current) {
            if (compensate) {
              const eleRect = firstErrRef.current.getBoundingClientRect();
              const top = Math.max(
                window.pageYOffset,
                document.documentElement.scrollTop,
                document.body.scrollTop,
              );
              window.scrollTo(0, eleRect.top + top + compensate);
            } else {
              firstErrRef.current.scrollIntoView();
            }
          }
        }

        return Promise.reject(errorInfo);
      });
  }, [validateFields]);

  const formRef = useMemo(() => ({
    setInitialFormData,
    setFormData,
    setFormWithData,
    setStaticData,
    validateFields,
    resetFields,
    getFieldValue,
    getFieldsValue,
    getFormData,
    validateScrollToError,
    setFieldsValue: setFormData,
  }), [
    setInitialFormData,
    setFormData,
    setFormWithData,
    setStaticData,
    validateFields,
    resetFields,
    getFieldValue,
    getFieldsValue,
    getFormData,
    validateScrollToError
  ]);

  return [formRef, {
    initialFormDataMoment,
    formMoment,
    staticDataMoment,
    formWithMoment,
  }];
}
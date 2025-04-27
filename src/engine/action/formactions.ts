import _get from 'lodash.get';
import { TPath } from '../render';
import { IActionOption } from './types';
import ActionConfig from './index';

export const getFormData = (data: { names: TPath }, options: IActionOption) => {
  const { formData, result } = options;
  const assignObj = { ...data, ...result };
  const { names } = assignObj;
  const tagForm = _get(formData, names, formData);

  return Promise.resolve(tagForm);
};

export const getFieldsValue = (data: { names: TPath[] }, options: IActionOption) => {
  const { form, result } = options;
  const assignObj = { ...data, ...result };
  const { names } = assignObj;
  const values = form ? form.getFieldsValue(names) : {};

  return Promise.resolve(values);
};

export const validateFields = (data: { names: TPath[]; showFirstMessage: boolean }, options: IActionOption) => {
  const { form, result } = options;
  const assignObj = { ...data, ...result };
  const { names, showFirstMessage } = assignObj;

  return form
    ? form.validateFields(names).catch((errors) => {
      if (showFirstMessage) {
        ActionConfig.toast(errors?.[0].error?.[0]);
      }
      return Promise.reject(errors);
    })
    : Promise.reject(Error('未获取到form'));
};

export const validateScrollToError = (data: { names: TPath[]; showFirstMessage: boolean; compensate?: number }, options: IActionOption) => {
  const { form, result } = options;
  const assignObj = { ...data, ...result };
  const { names, showFirstMessage, compensate } = assignObj;

  return form
    ? form.validateScrollToError(names, { compensate }).catch((errors) => {
      if (showFirstMessage) {
        ActionConfig.toast(errors?.[0].error?.[0]);
      }
      return Promise.reject(errors);
    })
    : Promise.reject(Error('未获取到form'));
};

export const resetFields = (data: { names: TPath[] }, options: IActionOption) => {
  const { form, result } = options;
  const assignObj = { ...data, ...result };
  const { names } = assignObj;

  if (form) {
    form.resetFields(names);
    return Promise.resolve(true);
  }

  return Promise.reject(Error('未获取到form'));
};

export const setFieldsValue = (data: { values: object }, options: IActionOption) => {
  const { form, result } = options;
  const nextData = { ...data?.values, ...result };

  if (form) {
    form.setFieldsValue(nextData)
    return Promise.resolve(result);
  }

  return Promise.reject(Error('未获取到form'));
};

export const setStaticData = (data: { values: object }, options: IActionOption) => {
  const { form, result } = options;
  const nextData = { ...data?.values, ...result };

  if (form) {
    form.setStaticData(nextData);
    return Promise.resolve(result);
  }

  return Promise.reject(Error('未获取到form'));
};
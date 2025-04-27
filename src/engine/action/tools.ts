import { useContext } from 'react';
import get from 'lodash.get';
import { AnalysisEngineContext } from '../render';
import ActionConfig from './index';
import { isObject } from '../utils/tools';
import { ActionProps, TActionsProps, IActionOption } from './types';
import { MethodProps } from '../types';

/**
 * 注册全局动作
 * @param actionList 动作列表
 * return object
 */
export const registerAction = (actionList: MethodProps) => {
  if (!(actionList && Object.keys(actionList).length)) {
    return ActionConfig;
  }

  Object.assign(ActionConfig, actionList);

  return ActionConfig;
};

export function _runAction(action: ActionProps | undefined, options?: IActionOption) {
  const { actions: optionsActions } = options || {};
  const actions = { ...ActionConfig, ...optionsActions };

  if (isObject(action)) {
    const { type, data, resolve, reject, ...otherOptions } = (action as ActionProps);

    if (type in actions) {
      return actions[type]?.(data, { ...options, ...otherOptions, actions })?.then?.((value: any) => {
        if (isObject(resolve) || Array.isArray(resolve)) {
          return runActions(resolve, { result: value, ...options, actions });
        } else {
          return value;
        }
      }, (error: any) => {
        if (isObject(reject) || Array.isArray(reject)) {
          return runActions(reject, { result: error, ...options, actions });
        } else {
          return Promise.reject(error);
        }
      });
    }
  }
}

export async function runActions(action: TActionsProps, options?: IActionOption) {
  if (!options?.actionEvn) {
    options = { ...options, actionEvn: {} };
  }

  let globalData = {};

  if (options.globleData instanceof Promise) {
    globalData = await options.globleData;
  } else if (isObject(options.globleData)) {
    globalData = options.globleData;
  }

  if (Array.isArray(action)) {
    return action.reduce(async (result: Promise<any> | undefined, currentAction, index: number) => {
      if (result) {
        result = await result;
      }

      const envKey = currentAction?.envKey || (index - 1);

      if (typeof envKey === 'string' || envKey >= 0) {
        (options?.actionEvn as { [key: string | number]: any })[envKey] = result;
      }

      currentAction = JSON.parse(JSON.stringify(currentAction).replace(/<%-(.+?)%>/g, (target, key) => {
        return get({
          ...options?.actionEvn,
          globalData,
          arguments: options?.arguments,
        }, key.replace(/\s/g, ''), '');
      }));

      const currentResult = await _runAction(currentAction, { result, ...options });

      return currentResult;
    }, undefined);
  }

  return _runAction(action as ActionProps, options);
}

export function useActions() {
  const { actions, formData, formRef, globleData, nameMap, update: AUpdate } = useContext(AnalysisEngineContext);

  return (action: TActionsProps, options?: IActionOption) => {
    return runActions(
      action,
      { actions, form: formRef, globleData, formData, update: AUpdate, nameMap, ...options }
    );
  };
}
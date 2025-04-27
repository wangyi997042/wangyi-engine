import * as tools from './tools';
import * as filters from './evalFilters';

/**
 * 执行条件
 * @param {string} expression  判断条件
 * @param {object} data        数据
 * @return {boolean}
 */
export const evalExpression = (expression: string, data?: any, globalData?: object): boolean => {
  try {
    /* eslint-disable-next-line */
    const fn = new Function(
      'data',
      'utils',
      'tools',
      'globalData',
      `with(data) {
        ${Object.keys(data).map((key) => `var ${key} = data['${key}'];`).join('')}
        ${/^\s*return\b/.test(expression) ? '' : 'return '}${expression};
      }`,
    );

    data = data || {};

    return fn.call(null, data, filters, tools, globalData);
  } catch (error) {
    console.error(error);
    console.info(`with(data) {
      ${Object.keys(data).map((key) => `var ${key} = data['${key}'];`).join('')}
      ${/^\s*return\b/.test(expression) ? '' : 'return '}${expression};
    }`);
    return false;
  }
};

// reg function

export function runExpression(expression: string, formData: object, globalData?: object) {
  let result: any = {
    result: undefined,
  };

  const evalResult = evalExpression(expression, formData, globalData);

  if (tools.isObject(evalResult)) {
    result = evalResult;
  } else if (typeof evalResult === 'boolean') {
    result.result = evalResult;
  }

  return result;
}

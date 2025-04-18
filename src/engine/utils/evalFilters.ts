import { isObject, isWindows } from './tools';
import { idCard } from './validates';

/**
 * 转换数字
 * @param {string | number} text  内容
 * return {number}
 */
export function toNumber(text: string | number): number {
  if (typeof text === 'number') {
    return text;
  }

  return parseInt(text, 10);
}

/**
 * 转换字符串
 * @param {string | number} text  内容
 * return {string}
 */
export function toString(text: string | number): string {
  if (typeof text === 'number') {
    return text.toString();
  }

  return text;
}

/**
 * 去掉前后空格
 * @param {string | number} value 值
 * return {string | number}
 */
export function trim(value: string | number) {
  // isWindows
  // 环境 系统window10／chrome浏览器／搜狗输入框／连打，按下失效
  if (typeof value !== 'string' || isWindows) {
    return value;
  }

  if (typeof value === 'string') {
    if (!String.prototype.trim) {
      return value.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    }

    return value.trim();
  }

  return value;
}

/**
 * 出生日期转换年龄
 * @param  {any}    date       时间
 * @param  {object} opts       参数
 * @config {string} currentDate  当前默认获取当天时间，today 获取当天时间、tomorrow 获取明天时间、yesterday 获取昨天时间
 * return number
 */
export function formatDateAge(date: any, opts?: { currentDate: string }): number {
  if (!date) {
    return date || 0;
  }

  // 转换标准yyyy-MM-dd
  if (typeof date === 'string' && date.length === 8) {
    date = `${date.substr(0, 4)}-${date.substr(4, 2)}-${date.substr(6, 2)}`;
  }

  const today: any = new Date();
  const keys = {
    today: 0,
    tomorrow: 1,
    yesterday: -1,
  };

  // 默认获取时间设置
  if (
    opts
    && opts.currentDate
    && typeof keys[opts.currentDate] !== 'undefined'
  ) {
    today.setDate(today.getDate() + keys[opts.currentDate]);
  }

  const birthDate = new Date(date.toString().replace(/-/g, '/'));
  let age: any = (today.getFullYear() - birthDate.getFullYear());
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return Number.isNaN(age) ? 0 : age;
}

/**
 * 查询目标是对象解析
 * @param {string} value   内容
 * @param {string} name    key值
 */
export function findValueObject(value: any, name: string = 'value') {
  if (value && isObject(value)) {
    value = value[name];
  }

  return value;
}

/**
 * 证件号转换年龄
 * @param {string} value   值
 */
export function formatCertAge(value: string) {
  if (
    value
    && idCard(value)
    && value.length === 18
  ) {
    const birthday = `${value.substr(6, 4)}/${Number(value.substr(10, 2))}/${Number(value.substr(12, 2))}`;

    return formatDateAge(birthday);
  }

  return 0;
}

// indexOf

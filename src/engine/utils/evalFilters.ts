import { isObject, isWindows } from './tools';
import { idCard, toTrim } from './validates';

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
    && typeof keys[opts.currentDate as keyof typeof keys] !== 'undefined'
  ) {
    today.setDate(today.getDate() + keys[opts.currentDate as keyof typeof keys]);
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
export function findValueObject(value: any, name = 'value') {
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

/**
 * 正则
 */
export const regex = {
  // 手机
  mobile: /^1\d{10}$/,
  // 邮箱
  email: /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/,
  // 钱
  money: /^([1-9][\d]{0,7}|0)(\.[\d]{1,2})?$/,
  // 用户
  name: /^([\u4e00-\u9fa5]+|[a-zA-Z0-9]+)$/,
  // 密码
  pwd: /(\d(?!\d{5})|[A-Za-z](?![A-Za-z]{5})){6}/,
  // 身份证
  idCardNo: /(^\d{15}$)|(^\d{17}([0-9]|X)$)/,
};

/**
 * 判断规则
 * @param {reg}    reg   正则
 * @param {string} value 值
 */
export const isRule = (reg: RegExp, value: string) => {
  if (!value || value.length === 0) {
    return false;
  }

  if (!(reg instanceof RegExp)) {
    throw new Error('The rule shoud be RegExp');
  }

  if (!reg.test(value)) {
    return false;
  }

  return true;
};

/**
 * 验证
 */
export const rules = {
  // 验证不为空
  isNotEmpty: (value: string) => {
    return value && value.length > 0;
  },
  // 验证手机
  isMobile: (value: string) => {
    return isRule(regex.mobile, value);
  },
  // 验证邮箱
  isEmail: (value: string) => {
    return isRule(regex.email, value);
  },
  // 验证金钱
  isMoney: (value: string) => {
    return isRule(regex.money, value);
  },
  // 验证用户名
  isUsername: (value: string) => {
    return isRule(regex.name, value);
  },
  // 验证用户名
  isPwd: (value: string) => {
    return isRule(regex.pwd, value);
  },
  // 验证身份证
  isIdCard: (value: string) => {
    if (!value || value.length !== 18) {
      return false;
    }

    value = toTrim(value);

    // eslint-disable-next-line max-len
    const city = { 11: '北京', 12: '天津', 13: '河北', 14: '山西', 15: '内蒙古', 21: '辽宁', 22: '吉林', 23: '黑龙江', 31: '上海', 32: '江苏', 33: '浙江', 34: '安徽', 35: '福建', 36: '江西', 37: '山东', 41: '河南', 42: '湖北', 43: '湖南', 44: '广东', 45: '广西', 46: '海南', 50: '重庆', 51: '四川', 52: '贵州', 53: '云南', 54: '西藏', 61: '陕西', 62: '甘肃', 63: '青海', 64: '宁夏', 65: '新疆', 71: '台湾', 81: '香港', 82: '澳门', 91: '国外' };
    const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
    const birthday = `${value.substr(6, 4)}/${Number(value.substr(10, 2))}/${Number(value.substr(12, 2))}`;
    const d = new Date(birthday);
    const newBirthday = `${d.getFullYear()}/${Number(d.getMonth() + 1)}/${Number(d.getDate())}`;
    const time = d.getTime();
    const currentTime = new Date().getTime();

    if (!value || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(value)) {
      return false;
    }

    // 非法地区
    if (!city[value.substr(0, 2) as unknown as keyof typeof city]) {
      return false;
    }

    if (time >= currentTime || birthday !== newBirthday) {
      return false;
    }

    if (value.length === 18) {
      let sum = 0;

      for (let i = 0; i < 17; i += 1) {
        sum += (value.substr(i, 1) as unknown as number) * factor[i];
      }

      // 校验位错误
      // eslint-disable-next-line
      if (parity[sum % 11] != value.substr(17, 1)) {
        return false;
      }
    }

    return true;
    // callback();
  },
  // 获取身份证出生日期／性别
  getIdCard: (value: string) => {
    if (!value) {
      return true;
    }

    const number = value.toUpperCase();

    // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
    if (!rules.isIdCard(number)) {
      return false;
    }

    const len = number.length;
    let birthday = '1990-01-01';
    let sex = 'M';

    if (len === 15) {
      // 获取出生日期
      birthday = `19${value.substring(6, 8)}-${value.substring(8, 10)}-${value.substring(10, 12)}`;
      // 获取性别
      sex = ((+value.substr(14, 1) % 2) === 1) ? 'M' : 'F';
    } else {
      // 获取出生日期
      birthday = `${value.substring(6, 10)}-${value.substring(10, 12)}-${value.substring(12, 14)}`;
      // 获取性别
      sex = ((+value.substr(16, 1) % 2) === 1) ? 'M' : 'F';
    }

    return {
      birthday,
      sex,
    };
  },
};

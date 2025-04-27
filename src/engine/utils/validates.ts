import React from "react";
import { TPath } from "../render";
import { resolvePath } from "./helper";
import { isObject, arrayHasChild } from "./tools";

export type TRules = {
  required?: boolean;
  message: string;
  type: 'idCard' | 'mobile' | 'email';
  pattern: string;
}[];

interface IErrorInfoItem {
  error?: string[];
  names?: TPath;
};

interface IErrorInfo {
  [key: string | number]: IErrorInfoItem,
}

interface IValidateProps {
  names?: Exclude<TPath, string | number>;
  rules?: TRules;
  value: any;
  ref: React.RefObject<any>;
}

/**
 * 去前后空格
 * @param {string} value  值
 * return {any}
 */
export function toTrim(value: string) {
  if (typeof value === 'string') {
    if (!String.prototype.trim) {
      return value.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    }

    return value.trim();
  }

  return value;
}

/**
 * 验证身份证
 * @param {string} value  值
 * return boolean
 */
export function idCard(value: string) {
  if (!value) {
    return false;
  }

  return /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(value);
}

/**
 * form rules 全局规则
 * https://github.com/nevergiveup-j/react-form-validates
 */

const rulesUtils = {
  // 验证身份证
  isIdCard: (value: any = '', callback: (message?: any) => void) => {
    value = toTrim(value);

    const city = { 11: '北京', 12: '天津', 13: '河北', 14: '山西', 15: '内蒙古', 21: '辽宁', 22: '吉林', 23: '黑龙江', 31: '上海', 32: '江苏', 33: '浙江', 34: '安徽', 35: '福建', 36: '江西', 37: '山东', 41: '河南', 42: '湖北', 43: '湖南', 44: '广东', 45: '广西', 46: '海南', 50: '重庆', 51: '四川', 52: '贵州', 53: '云南', 54: '西藏', 61: '陕西', 62: '甘肃', 63: '青海', 64: '宁夏', 65: '新疆', 71: '台湾', 81: '香港', 82: '澳门', 91: '国外' };
    const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
    const birthday = `${value.substr(6, 4)}/${Number(value.substr(10, 2))}/${Number(value.substr(12, 2))}`;
    const d = new Date(birthday);
    const newBirthday = `${d.getFullYear()}/${Number(d.getMonth() + 1)}/${Number(d.getDate())}`;
    const time = d.getTime();
    const currentTime = new Date().getTime();

    if (!idCard(value)) {
      return callback('证件号码格式错误');
    }

    // 非法地区
    if (!city[(value.substr(0, 2) as keyof typeof city)]) {
      return callback('请输入有效证件号码');
    }

    if (time >= currentTime || birthday !== newBirthday) {
      return callback('生日错误');
    }

    if (value.length === 18) {
      let sum = 0;

      for (let i = 0; i < 17; i += 1) {
        sum += value.substr(i, 1) * factor[i];
      }

      // 校验位错误
      // eslint-disable-next-line
      if (parity[sum % 11] != value.substr(17, 1).toUpperCase()) {
        return callback('请输入有效证件号码');
      }
    }

    callback();
  },
  // 验证手机号
  isMobile: (value = '', callback: (message?: any) => void) => {
    if (!/^1[23456789]\d{9}$/.test(value)) {
      return callback('请输入正确的手机号码');
    }

    callback();
  },
  // 验证邮箱
  isEmail: (value = '', callback: (message?: any) => void) => {
    if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value)) {
      return callback('请输入正确的电子邮箱');
    }

    callback();
  },
};

export class ValidateUtils {
  errorFields: IErrorInfo = {};

  errorMount: { [key: string]: boolean } = {};

  errorRef: { [key: string]: React.RefObject<Element> } = {};

  firstMount = false;

  required = (value: any) => {
    if (value === undefined || value === '' || value === null) {
      return false;
    }

    if (Array.isArray(value) && value.length === 0) {
      return false;
    }

    return true;
  };

  setErrorMoment = (namse: TPath[]) => {
    if (Array.isArray(namse)) {
      namse.forEach((name) => {
        this.setFirstMount(resolvePath(name));
      });
    }
  };

  setError = (error: string[], names: TPath, ref: React.RefObject<any>) => {
    this.errorFields[resolvePath(names).join('.')] = {
      error,
      names,
    };
    this.errorRef[resolvePath(names).join('.')] = ref;
  };

  getErrorRef = (names: string) => {
    const paths = resolvePath(names);

    if (arrayHasChild(paths)) {
      return this.errorRef[paths.join('.')];
    }

    return undefined;
  };

  reload = () => {
    this.errorRef = {};
    this.errorFields = {};
  };

  resetError = (names?: TPath[]) => {
    this.firstMount = false;
    this.errorRef = {};

    if (Array.isArray(names)) {
      names.forEach((name) => {
        const namestring = resolvePath(name).join('.');
        if (this.errorMount[namestring]) {
          this.errorMount[namestring] = false;
        }
      });
    } else {
      this.errorMount = {};
    }
  };

  setFirstMount = (names?: Exclude<TPath, string | number>) => {
    if (arrayHasChild(names)) {
      this.errorMount[names.join('.')] = true;
    }
  };

  getFirstMount = (names: Exclude<TPath, string | number>) => {
    if (arrayHasChild(names)) {
      return this.errorMount[names.join('.')];
    }

    return false;
  };

  getAllError = () => {
    const errorList: IErrorInfoItem[] = [];

    Object.keys(this.errorFields).forEach((key) => {
      errorList.push(this.errorFields[key]);
    });

    return errorList;
  };

  hasError(names?: (string | number)[]) {
    if (arrayHasChild(names)) {
      return !!this.errorFields[(names as string[]).join('.')]
    }

    return false;
  }

  hasErrors(names?: TPath[]) {
    if (arrayHasChild(names)) {
      names = (names as TPath[]).map((name) => resolvePath(name).join('.'))
      return (names as string[]).some((name) => !!this.errorFields[name]);
    }

    // 如果未制定names，怎全局判断
    if (this.getAllError().length > 0) {
      return true;
    }

    return false;
  }

  removeError(names: Exclude<TPath, string | number>) {
    if (arrayHasChild(names)) {
      delete this.errorFields[names.join('.')];
    }
  }

  valitate = ({ names, rules, value, ref }: IValidateProps) => {
    if (Array.isArray(rules) && arrayHasChild(names)) {
      const error: string[] = [];

      rules.forEach((rule) => {
        if (!isObject(rule)) {
          return;
        }

        if (typeof rule.required === 'boolean') {
          if (rule.required && !this.required(value)) {
            error.push(rule.message);
          }
          return;
        }

        if (typeof rule.pattern === 'string') {
          const regexp = new RegExp(rule.pattern);

          if (!regexp.test(value)) {
            error.push(rule.message);
          }
          return;
        }

        if (typeof rule.type === 'string') {
          switch (rule.type) {
            case 'idCard':
              rulesUtils.isIdCard(value, (err) => {
                err && error.push(rule.message || err);
              });
              break;
            case 'mobile':
              rulesUtils.isMobile(value, (err) => {
                err && error.push(rule.message || err);
              });
              break;
            case 'email':
              rulesUtils.isEmail(value, (err) => {
                err && error.push(rule.message || err);
              });
              break;
          }
        }
      });

      if (error.length > 0) {
        this.setError(error, names, ref);
      } else if (this.hasError(names)) {
        this.removeError(names);
      }

      if (this.firstMount || this.getFirstMount(names)) {
        this.setFirstMount(names);
        return error[0];
      }

      return undefined;
    }
  }
};

export default rulesUtils;

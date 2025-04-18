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
export default {
  // 验证身份证
  isIdCard: (_rule: any, value: any = '', callback: (message?: any) => void) => {
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
    if (!city[value.substr(0, 2)]) {
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
  isMobile: (_rule: any, value: string = '', callback: (message?: any) => void) => {
    if (!/^1[3456789]\d{9}$/.test(value)) {
      return callback('请输入正确的手机号码');
    }

    callback();
  },
  // 验证邮箱
  isEmail: (_rule: any, value: string = '', callback: (message?: any) => void) => {
    if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value)) {
      return callback('请输入正确的电子邮箱');
    }

    callback();
  },
};

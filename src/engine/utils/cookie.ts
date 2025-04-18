export default {
  /**
   * 设置值
   * @param {string} name  名字key
   * @param {string} value 值
   * @param {number} days  失效时间，1/天
   * @param {string} path  路径，默认/
   * @param {string} domain 域名设置
   */
  set(name: string, value: string, days?: number, path?: string, domain?: string) {
    // server side
    if (typeof document === 'undefined') {
      return '';
    }

    let expires = '';
    if (days) {
      const date: any = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toGMTString()}`;
    }

    const dir = path || '/';
    if (domain) {
      document.cookie = `${name}=${value}${expires}; domain=${domain}; path=${dir}`;
      return;
    }
    document.cookie = `${name}=${value}${expires}; path=${dir}`;
  },
  /**
   * 获取cookie
   * @param {string} name  名字key
   */
  get(name: string): string {
    // server side
    if (typeof document === 'undefined') {
      return '';
    }

    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i += 1) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return '';
  },
  /**
   * 删除cookie
   * @param {string} name  名字key
   */
  remove(name: string) {
    this.set(name, '', -1);
  },
};

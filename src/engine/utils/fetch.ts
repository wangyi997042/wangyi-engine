import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { isIOS, parserBrowser } from './tools';
import cookie from './cookie';

// 创建 axios 实例
const instance = axios.create({
  baseURL: '/api', // 默认的基础路径，可根据需要修改
  timeout: 10000, // 请求超时时间
});

// 请求拦截器
instance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 添加公共参数
    const urlParams = {
      _client: isIOS ? 1 : 2,
      __MYLOG_UID: cookie.get('__MYLOG_UID') || '',
      __MYLOG_SID: cookie.get('__MYLOG_SID') || '',
      _browser: parserBrowser(),
    };

    const query = Object.keys(urlParams)
      .map((key) => `${key}=${encodeURIComponent(urlParams[key])}`)
      .join('&');

    if (config.url) {
      config.url += config.url.includes('?') ? `&${query}` : `?${query}`;
    }

    return config;
  },
  (error) => {
    // 请求错误处理
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 统一处理响应数据
    return response.data;
  },
  (error) => {
    // 统一处理错误
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 封装 GET 请求
export const get = <T = any>(url: string, params?: object): Promise<T> => {
  return instance.get(url, { params });
};

// 封装 POST 请求
export const post = <T = any>(url: string, data?: object): Promise<T> => {
  return instance.post(url, data);
};

// 默认导出 axios 实例
export default instance;
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { isIOS, parserBrowser } from './tools';
import cookie from './cookie';

// 创建 axios 实例
const instance = axios.create({
  baseURL: process.env.API_BASE_URL || '/api', // 动态设置 baseURL
  timeout: 10000, // 请求超时时间
});

// 请求拦截器
instance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const urlParams = {
      _client: isIOS ? 1 : 2,
      __MYLOG_UID: cookie.get('__MYLOG_UID') || '',
      __MYLOG_SID: cookie.get('__MYLOG_SID') || '',
      _browser: parserBrowser(),
    };

    config.params = {
      ...urlParams,
      ...(config.params || {}),
    };

    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('请求超时，请稍后重试');
    } else if (error.response) {
      console.error('服务器错误:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('网络错误或超时:', error.message);
    } else {
      console.error('请求配置错误:', error.message);
    }
    return Promise.reject(error);
  }
);

// 封装 GET 请求
export const get = <T = any, P = object>(url: string, params?: P): Promise<T> => {
  return instance.get(url, { params });
};

// 封装 POST 请求
export const post = <T = any, D = object>(url: string, data?: D): Promise<T> => {
  return instance.post(url, data);
};

// 封装 PUT 请求
export const put = <T = any, D = object>(url: string, data?: D): Promise<T> => {
  return instance.put(url, data);
};

// 封装 DELETE 请求
export const del = <T = any, P = object>(url: string, params?: P): Promise<T> => {
  return instance.delete(url, { params });
};

export default instance;
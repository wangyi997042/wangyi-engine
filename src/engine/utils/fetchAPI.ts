import { get, post } from './fetch';
import { isObject, isIOS, parserBrowser } from './tools';
import { ObjectProps } from '../types';
import cookie from './cookie';

/**
 * 接口请求
 */
export const fetchAPI = {
  fetch: async (data: { path: string; method?: 'GET' | 'POST'; body?: object }) => {
    const { path, method = 'GET', body } = data;

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

    const fullPath = path.includes('?') ? `${path}&${query}` : `${path}?${query}`;

    // 根据请求方法调用封装的 axios 方法
    if (method === 'GET') {
      return get(fullPath);
    } else if (method === 'POST') {
      return post(fullPath, body);
    } else {
      throw new Error(`Unsupported method: ${method}`);
    }
  },
};

export interface FetchResultProps {
  content?: ObjectProps;
  result?: ObjectProps;
}

/**
 * 接口请求报文结果
 * @param data
 */
export const getFetchResult = (data: FetchResultProps) => {
  if (data && isObject(data.content)) {
    return data.content;
  }

  if (data && isObject(data.result)) {
    return data.result;
  }
};

export default fetchAPI;
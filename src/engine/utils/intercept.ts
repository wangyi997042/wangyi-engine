import { findId } from '../dataMaps';
import { findName } from './helper';
import { isFunction } from './tools';
import {
  EngineProps,
  DataMapsProps,
  FrameworkLifeCycles,
} from '../types';

export interface EventsProps {
  onChange: (item: any, others?: any) => void;
  [propName: string]: any;
}

export interface EventOptions {
  data: EngineProps;
  dataMaps: DataMapsProps;
  autoRunning: boolean;
}

/**
 * 劫持onChange事件回调
 * @param  {object} event         事件
 * @param  {object} options       配置
 * @config {object} data          数据
 * @config {object} dataMaps      组件Maps
 * @config {boolean} autoRunning  自动运行
 * @config {object} lifecycle     生命周期
 */
export const interceptEvent = <T>(
  event: T,
  options: EventOptions,
  lifecycle?: FrameworkLifeCycles,
): T => {
  const {
    data,
    dataMaps,
    autoRunning,
  } = options || {};

  // 重绑事件
  if (
    event
    && Object.keys(event).length
  ) {
    const events: any = {};

    Object.keys(event).forEach((key) => {
      if (/^on/.test(key)) {
        events[key] = (item: any, ...props: any[]) => {
          if (item) {
            // 临时注释代码，调试发现未起作用。
            // 更新组件数据
            if (
              autoRunning
              && item._id
              && dataMaps
            ) {
              const findItem = findId(item._id, dataMaps);

              // value 有值才会触发
              if (
                findItem
                && typeof item.value !== 'undefined'
                && findItem.value !== item.value
              ) {
                findItem.value = item.value;
              }
            }

            // 更新原始数据value
            if (
              item._crengine
              && item._crengine.name
              && data
              // && typeof item.value !== 'undefined'
            ) {
              const findSourceItem = findName(item._crengine.name, data, item._crengine.path);

              findSourceItem.value = item.value;
            }
          }

          // 执行事件生命周期
          if (lifecycle && lifecycle.afterEvent && isFunction(lifecycle.afterEvent)) {
            lifecycle.afterEvent(data);
          }

          if (typeof event[key] === 'function') {
            event[key](item, ...props);
          }
        };
      }
    });

    return events;
  }

  return event;
};

export default interceptEvent;

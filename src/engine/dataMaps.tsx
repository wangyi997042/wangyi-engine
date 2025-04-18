import {
  deepCopy,
  isEquals,
} from './utils/tools';

import {
  getStore,
  addStore,
} from './store/store';

import {
  EngineProps,
  TreeProps,
  DataMapsProps,
  DataMapValue,
} from './types';

/**
 * 查询Id数据
 * @param {string} id       树唯一ID
 * @param {object} dataMaps  组件Maps
 */
export function findId(
  id: string,
  dataMaps: DataMapsProps,
): any {
  if (!(id && dataMaps)) {
    return null;
  }

  return dataMaps[id];
}

export default class DataMaps {
  props: EngineProps;

  dataMaps: any;

  constructor(props: EngineProps, tree: TreeProps, storeId: string) {
    this.props = props;

    const MAPS_ID = `MAPS_${storeId}`;
    let dataMaps = getStore(MAPS_ID);

    this.dataMaps = dataMaps || {};

    if (!dataMaps) {
      dataMaps = this.create(tree, props);
      addStore(dataMaps, MAPS_ID);
    } else {
      this.update(tree, props);
    }

    return dataMaps;
  }

  // 获取单个Map
  getItemMap = (props: EngineProps): any => {
    const {
      widget,
      dataBind,
      paramType,
      cascadeOn,
      name,
      wprops,
      value,
      defaultValue,
      hideChildren,
      childrens,
      ...others
    } = props;

    const data: DataMapValue = {
      ...others,
      widget,
    };

    if (typeof defaultValue !== 'undefined') {
      data.defaultValue = defaultValue;
    }

    if (typeof value !== 'undefined') {
      data.value = value;
    }

    if (dataBind) {
      data.dataBind = dataBind;
    }

    if (paramType) {
      data.paramType = paramType;
    }

    if (wprops) {
      data.wprops = deepCopy(wprops);
    }

    // 子级
    if (hideChildren && (childrens && Array.isArray(childrens) && childrens.length)) {
      data.$childrens = childrens;
    }

    return data;
  };

  /**
   * 创建数据Maps
   * @param {object} props  数据
   * @param {object} tree   树结构
   * @param {object} maps   递归
   */
  create(
    tree: TreeProps,
    props: EngineProps,
    maps: DataMapsProps = {},
  ) {
    const {
      id,
      childNodes,
    } = tree;
    const {
      wprops,
      childrens,
    } = props;

    if (id && wprops) {
      maps[id] = this.getItemMap(props);
    }

    if (childNodes && Array.isArray(childNodes) && childNodes.length) {
      let data: any = {};

      childNodes.forEach((item, key) => {
        data = childrens[key];
        this.create(item, data, maps);
      });
    }

    return maps;
  }

  // 更新
  update(
    tree: TreeProps,
    props: EngineProps,
  ) {
    const {
      id,
      childNodes,
    } = tree;

    if (id) {
      const newData: any = this.getItemMap(props);

      if (this.dataMaps[id]) {
        const oldData = this.dataMaps[id];

        // 属性不同，更新新的数据
        if (!isEquals(oldData, newData)) {
          const newMaps: any = {};

          if (oldData && typeof oldData._cascadeValue !== 'undefined') {
            newMaps._cascadeValue = oldData._cascadeValue;
            newMaps.value = oldData.value;
          }

          this.dataMaps[id] = {
            ...newMaps,
            ...newData,
          };
        }
      // add new components
      } else if (props && props.wprops) {
        this.dataMaps[id] = newData;
      }
    }

    if (childNodes && Array.isArray(childNodes) && childNodes.length) {
      const isChild = (props.childrens && Array.isArray(props.childrens) && props.childrens.length);
      const len = (props.childrens ? props.childrens.length : 0);

      childNodes.forEach((item, key) => {
        if (isChild && key <= len - 1) {
          this.update(item, props.childrens[key]);
        }
      });
    }
  }
}

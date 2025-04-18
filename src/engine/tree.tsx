import {
  isObject,
  deepCopy,
  serialId,
} from './utils/tools';
import { resolvePath } from './utils/helper';

import {
  EngineProps,
  TreeProps,
} from './types';

type PathProps = any[];

/**
 * 查询树子级
 * @param {array}   namePath  目标names
 * @param {array}}  nodes     树子级
 * return {object}
 */
export function findTreeNode(
  namePath: string[],
  nodes: any[],
): any {
  if (!namePath || !Array.isArray(nodes)) {
    return {};
  }

  const len = nodes.length;
  const pathLen = namePath.length;
  let start = -1;
  let node: any;
  let filterData = {};

  for (let i = 0; i < len; i++) {
    node = nodes[i];
    start = namePath.indexOf(node.name);

    if (start > -1) {
      // 查找最后Key
      if (start >= pathLen - 1) {
        filterData = node;
        break;
      } else if (node.childNodes) {
        return findTreeNode(namePath, node.childNodes);
      // cascade find name
      } else if (node.valueType === 'object') {
        filterData = node;
        break;
      }
    }
  }

  // 当前层级未查询结果，继续查询子级
  if (!(filterData && Object.keys(filterData).length)) {
    for (let i = 0; i < len; i++) {
      node = nodes[i];

      if (node.childNodes) {
        filterData = findTreeNode(namePath, node.childNodes);

        if (filterData && Object.keys(filterData).length) {
          break;
        }
      }
    }
  }

  return filterData;
}

/**
 * 查询树叉
 * @param {string}  name  目标name
 * @param {object}  tree  树数据
 * return {object}
 */
export function findTreeFork(
  name: string,
  tree: TreeProps,
) {
  if (!(name && tree)) {
    return {};
  }

  const namePath = resolvePath(name);
  const len = namePath.length;
  const { childNodes } = tree;

  if (tree.name && namePath.indexOf(tree.name) > -1) {
    const start = namePath.indexOf(tree.name);

    if (start > -1 && start >= len - 1) {
      return tree;
    }
  }

  if (childNodes) {
    return findTreeNode(namePath, childNodes);
  }

  return {};
}

/**
 * 查询一组树
 * @param {array}   names  目标name
 * @param {object}  tree   树数据
 * return {object}
 */
export function findTreeNames(
  names: string[],
  tree: TreeProps,
) {
  const treeData: any[] = [];

  if (Array.isArray(names) && names.length) {
    let item = {};

    names.map((name) => {
      item = findTreeFork(name, tree);

      if (item && Object.keys(item).length) {
        treeData.push(item);
      }

      return name;
    });
  }

  return treeData;
}

/**
 * 查询树Name
 * @param {string}  name  目标name
 * @param {object}  tree  树结构
 */
export function findTreeName(
  name: string,
  tree: TreeProps,
): any {
  if (!name) {
    return {};
  }

  return findTreeNames([name], tree);
}

export default class Tree {
  // 数据
  props: EngineProps;

  // 路径
  path: PathProps;

  // 层级
  level: number;

  treeLevel: number;

  // 数据保存ID
  storeId: string;

  // 树
  tree: any;

  constructor(props: EngineProps, storeId: string, path: PathProps = []) {
    this.props = props;
    this.path = path;
    this.level = (path.length || 0);

    this.storeId = storeId;
    this.tree = this.create(props, deepCopy(this.path), this.level);
    this.treeLevel = 0;

    // this.levelOrder(props);

    return this.tree;
  }

  /**
   * 获取子级
   * @param {object} props 数据
   */
  getItemFork = (props: EngineProps): any => {
    const {
      name,
      dataBind,
      hidden,
      cascadeOn,
      cascadeSync,
    } = props;
    const data: any = {};

    // 显示、隐藏
    if (typeof hidden !== 'undefined') {
      data.hidden = hidden;
    }

    // 组件标示，防止组件未配置dataBind
    if (name || dataBind) {
      data.name = name || dataBind;
    }

    // 监控联动
    if (cascadeOn) {
      data.cascadeOn = cascadeOn;
    }

    // 联动同步
    if (cascadeSync) {
      data.cascadeSync = cascadeSync;
    }

    return data;
  };

  // levelOrder(
  //   node: EngineProps,
  //   path: PathProps = [],
  // ) {
  //   const queue: any[] = [];

  //   queue.push(node);

  //   let isChild: boolean = false;

  //   while (queue.length !== 0) {
  //     node = queue.shift();

  //     if (isChild) {
  //       node.childrens.forEach((subNode) => queue.push(subNode));
  //     }
  //   }
  // }

  /**
   * 创建树
   * @param {object}   props      数据
   * @param {string[]} path       路径
   * @param {number}   level      层级
   * @param {number[]} serialPath 序列路径
   */
  create(
    props: EngineProps,
    path: PathProps = [],
    level: number = 0,
    serialPath: number[] = [1],
  ) {
    const {
      hideChildren,
      childrens,
      dataBind,
      value,
      defaultValue,
    } = props;

    const tree: any = this.getItemFork(props);
    const isChild = (childrens && Array.isArray(childrens) && childrens.length);

    // 添加路径
    if (dataBind || path.length) {
      // clear path ['a', 'b', 'c'] level = 1
      path.splice(level);

      if (isChild && dataBind) {
        path[level] = dataBind;
        level += 1;
      }

      if (!tree.path && path.length) {
        tree.path = deepCopy(path);
      }
    }

    const _id = (props._id || serialId(`${this.storeId}_${serialPath.join('_')}`));

    // 创建唯一ID
    if (!tree.id) {
      tree.id = _id;
    }

    // value object，use onCascade
    if (isObject(value) || isObject(defaultValue)) {
      tree.valueType = 'object';
    }

    // 渲染子级
    if (isChild) {
      // 无需渲染子级
      if (hideChildren) {
        tree.hideChild = true;
      } else {
        const childs: any[] = [];

        // 序列路径
        serialPath.push(1);

        const len = serialPath.length;

        childrens.forEach((item: EngineProps, key: number) => {
          serialPath[len - 1] = (key + 1);
          childs.push(this.create(item, path, level, serialPath));
        });

        if (childs.length) {
          tree.childNodes = childs;
        }
      }
    } else {
      serialPath.pop();
    }

    return tree;
  }
}

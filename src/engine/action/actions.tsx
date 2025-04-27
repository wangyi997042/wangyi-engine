import React from 'react';
import ReactDOM from 'react-dom';
import _get from 'lodash.get';
import _set from 'lodash.set';
import { isMobile, isObject, deepCopy, isFunction, uuid, arrayHasChild } from '../utils/tools';
import { getDataFromNameIdMapOrNameMap, addIndexToPaths } from '../utils/helper';
import { AnalysisEngine, IWidgetData } from '../render';
import { assignObj } from '../cascade';
import { Modal, LockScroll, Popup } from '../components';
import { TPath } from '../render/types';
import { TActionOptions } from './types';

export const hidden = (data: { names: TPath }, options: TActionOptions) => {
  const { result } = options;
  const objassign = { ...data, ...result };
  const dataProxy = getDataFromNameIdMapOrNameMap(objassign, options, '_dataProxy');

  if (isObject(dataProxy)) {
    dataProxy.hidden = true;
  }

  return Promise.resolve({});
};

export const update = (data: { names: TPath, value: any, wprops: any }, options: TActionOptions) => {
  const { result, self, dataProxy: optionsDataProxy } = options;
  const objassign = { ...data, ...result };
  const { names, ...others } = objassign;
  const dataProxy = getDataFromNameIdMapOrNameMap(objassign, options, '_dataProxy');

  if (self && optionsDataProxy) {
    assignObj(optionsDataProxy, others);
  } else if (isObject(dataProxy)) {
    assignObj(dataProxy, others);
  }

  return Promise.resolve({});
};

export const copyChildren = (data: any, options: TActionOptions & { update: () => void }) => {
  const { result, update: AUpdate } = options;
  const objassign = { ...data, ...result };
  const { byValue, childrens: cloneChildren } = objassign;
  const dataProxy = getDataFromNameIdMapOrNameMap(objassign, options, '_dataProxy');

  if (isObject(dataProxy) && Array.isArray(cloneChildren) && cloneChildren.length > 0) {
    const { childrens = [], value } = dataProxy;
    const { length } = cloneChildren;
    const cloneChildrenList = (byValue && Array.isArray(value)) ? value.map(() => deepCopy(cloneChildren)) : deepCopy(cloneChildren);
    const nextChildren = [].concat(childrens, cloneChildrenList).map((item: IWidgetData, index) => {
      if (isObject(item)) {
        addIndexToPaths(item, Math.floor(index / length));

        item.uuid = uuid();
      }
      return item;
    });

    dataProxy.childrens = nextChildren;

    AUpdate && AUpdate();
  }

  return Promise.resolve({});
};

// 删除当前元素最近的一个父元素
export const deleteChildren = (data: any, options: TActionOptions & any) => {
  const { parent, index, update: AUpdate, result } = options || {};
  const objassign = { ...data, ...result };
  const { length = 1, names, index: deleteIndex } = objassign;
  let _parent;
  let _index = index;

  if (typeof names === 'string' || arrayHasChild(names)) {
    const target = getDataFromNameIdMapOrNameMap(objassign, options, '_dataProxy');
    let _selfParent = parent;
    let preElement;

    while (_selfParent && target !== _selfParent) {
      preElement = _selfParent;
      _selfParent = _selfParent._parent;
    }

    if (target === _selfParent) {
      _parent = _selfParent;
      _index = preElement.index;
    }
  }

  const { childrens } = _parent;
  const getDeleteIndex = +deleteIndex >= 0 ? deleteIndex : _index;

  const nextChildren = childrens.filter((child: never, tindex: number) => getDeleteIndex !== Math.floor(tindex / length)).map((item: IWidgetData, tindex: number) => {
    if (isObject(item)) {
      addIndexToPaths(item, Math.floor(tindex / length));

      item.uuid = uuid();
    }
    return item;
  });

  _parent.childrens = nextChildren;

  AUpdate && AUpdate();

  return Promise.resolve({});
};

export const getGlobleData = (data: any, options: TActionOptions & any) => {
  const { globleData, result } = options || {};
  const objassign = { ...data, ...result };
  const { globleId } = objassign;

  return globleData.then((globalData: any) => {
    const tagForm = globleId ? _get(globalData, globleId) : globalData;

    return Promise.resolve(tagForm);
  });
};

export const flexibleModal = (data: any, options: TActionOptions & any) => {
  const { callback, result, options: contextOptions } = options || {};
  const assignData = { ...result, ...data, };
  const { header, footer, content } = assignData;

  if (document.getElementById('actionFlexibleModal')) {
    return Promise.reject();
  }

  const div = document.createElement('div');
  div.id = 'actionFlexibleModal';
  document.body.appendChild(div);

  const prefixCls = 'cre-flexible-modal';
  const modelCls = isMobile ? `${prefixCls}-mobile` : `${prefixCls}-web`;
  const width = isMobile ? '80%' : '880px';
  const type = isMobile ? 'app' : 'pc';

  // 关闭弹层
  const onClose = () => {
    if (callback && isFunction(callback)) {
      callback(content);
    }

    ReactDOM.unmountComponentAtNode(div);
    document.body.removeChild(div);
  };

  return new Promise((resolve) => {
    ReactDOM.render(
      <Modal
        visible
        className={`${prefixCls} ${modelCls}`}
        width={width}
        onMaskClick={() => {
          resolve({});
          onClose()
        }}
      >
        <AnalysisEngine
          type={type}
          options={contextOptions}
          dataSource={{ widget: '' }}
        >
          <Modal.Header
            title={<AnalysisEngine embed dataSource={header} />}
            closable
            onClose={() => {
              resolve({});
              onClose()
            }}
          />
          <Modal.Body>
            <AnalysisEngine
              embed
              dataSource={content}
            />
          </Modal.Body>
          {
            footer
            && (
              <Modal.Footer>
                <AnalysisEngine
                  embed
                  dataSource={footer}
                />
              </Modal.Footer>
            )
          }
        </AnalysisEngine>
      </Modal>,
      div,
    );
  });
};

export const flexiblePopup = (data: any, options: TActionOptions & any) => {
  const { callback, result, options: contextOptions } = options || {};
  const assignData = { ...result, ...data, };
  const { content, footer, header, direction } = assignData;

  if (document.getElementById('actionFlexiblePopup')) {
    return Promise.reject();
  }

  const div = document.createElement('div');
  div.id = 'actionFlexiblePopup';
  document.body.appendChild(div);

  const prefixCls = 'cre-flexible-flexible';
  const modelCls = isMobile ? `${prefixCls}-mobile` : `${prefixCls}-web`;
  const width = isMobile ? '80%' : '880px';
  const type = isMobile ? 'app' : 'pc';

  // 关闭弹层
  const onClose = () => {
    if (callback && isFunction(callback)) {
      callback(content);
    }

    ReactDOM.unmountComponentAtNode(div);
    document.body.removeChild(div);
  };

  return new Promise((resolve, reject) => {
    const currentOptions = {
      ...contextOptions,
      actions: {
        ...contextOptions?.actions,
        onOk: (e: Event, doptions: any) => {
          resolve(doptions?.result);
          onClose();
        },
        onCancel: () => {
          reject();
          onClose();
        },
      },
    }

    ReactDOM.render(
      <LockScroll visible>
        <Popup
          visible
          className={`${prefixCls} ${modelCls}`}
          width={width}
          direction={direction}
          onMaskClick={() => {
            resolve({});
            onClose()
          }}
        >
          <AnalysisEngine
            type={type}
            options={currentOptions}
            dataSource={{ widget: '' }}
          >
            <div className={`${prefixCls}-body`}>
              <div className={`${prefixCls}-header`}>
                <div className={`${prefixCls}-header-title`}>
                  <AnalysisEngine
                    embed
                    dataSource={header}
                  />
                </div>
                <span className={`${prefixCls}-header-close`} onClick={() => { reject(); onClose(); }} />
              </div>
              <div className={`${prefixCls}-body`}>
                <AnalysisEngine
                  embed
                  dataSource={content}
                />
              </div>
              <div className={`${prefixCls}-footer`}>
                <AnalysisEngine
                  embed
                  dataSource={footer}
                />
              </div>
            </div>
          </AnalysisEngine>
        </Popup>
      </LockScroll>,
      div,
    );
  });
};

export const makeNextObject = (data: any, options: any) => {
  const { result } = options;
  const objassign = { ...data, ...result, result };
  const { queue, ...others } = objassign;
  const nextObj = {};

  if (Array.isArray(queue)) {
    queue.forEach((name) => {
      const left = name?.[0];
      const right = name?.[1];
      const rightObj = right ? _get(others, right) : others;

      if (typeof left === 'string' || typeof left === 'number') {
        _set(nextObj, left, rightObj);
      } else {
        Object.assign(nextObj, rightObj);
      }
    });
  }

  return Promise.resolve(nextObj);
}

export const JSONStringify = (data: any, options: any) => {
  const { result } = options;
  const objectAssign = { ...data, ...result };

  try {
    const jsonstring = JSON.stringify(objectAssign);

    return Promise.resolve({
      jsonstring,
    });
  } catch (e) {
    return Promise.reject();
  }
}
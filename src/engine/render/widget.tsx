import React from 'react';
import { DataRenderContext } from './store';
import { DataRender } from './dataRender';
import { getPath, resolvePath } from '../utils/helper';
import { TEffectivenessResult, IContextBoxProps, IWidgetData, TDataSource, TPath } from './types';
import { isObject, addUuidToObj } from '../utils/tools';

// 判断组件格式
export function isEffectiveWidget(data?: any) {
  if (isObject(data) && (typeof data.widget === 'string' || Array.isArray(data.childrens))) {
    return true;
  }

  return false;
}

export function ContextBox(props: IContextBoxProps) {
  const { index } = props;

  return (
    <DataRenderContext.Consumer>
      {
        ({ dataBinds, paths, dataProxy }) => {
          return (
            <DataRender {...props} _parent={dataProxy} index={index} _parentPath={paths} _parentDataBinds={dataBinds} />
          )
        }
      }
    </DataRenderContext.Consumer>
  );
}

export function StaticEffectivenessWidget(
  props: TDataSource | undefined,
  callback: (data: {
    data: IWidgetData;
    dataBind: TPath;
    dataBinds: (string | number | undefined)[];
    path: TPath;
    paths: (string | number | undefined)[];
  }) => void,
  options: { parentDataBinds: (string | number | undefined)[]; parentPath: (string | number | undefined)[]; } = { parentDataBinds: [], parentPath: [] }
) {
  if (props) {
    if (Array.isArray(props)) {
      (props as TDataSource[]).map((item) => {
        return StaticEffectivenessWidget(item, callback, options);
      });
    } else if (isEffectiveWidget(props)) {
      const { parentDataBinds, parentPath } = options;
      const dataBind = getPath(props);
      const dataBinds = ([] as (string | number | undefined)[]).concat(parentDataBinds, dataBind).filter((item) => ['string', 'number'].indexOf(typeof item) >= 0);
      const path = resolvePath(props?.name);
      const paths = ([] as (string | number | undefined)[]).concat(parentPath, path).filter((item) => ['string', 'number'].indexOf(typeof item) >= 0);

      typeof callback === 'function' && callback({
        data: props,
        dataBind,
        dataBinds,
        path,
        paths,
      });

      if (props.options && isObject(props.options)) {
        Object.keys((props.options)).forEach((key: string) => {
          StaticEffectivenessWidget(props?.options?.[key], callback, {
            parentDataBinds: dataBinds,
            parentPath: paths,
          });
        });
      }

      if (props.childrens) {
        StaticEffectivenessWidget(props.childrens, callback, {
          parentDataBinds: dataBinds,
          parentPath: paths,
        })
      }
    }
  }
}

export function EffectivenessWidget(props: TDataSource | undefined, preIndex?: number): TEffectivenessResult {
  if (props) {
    if (Array.isArray(props)) {
      const result = (props as TDataSource[]).map((item, index) => {
        return EffectivenessWidget(item, index);
      });

      return result as TEffectivenessResult;
    }

    if (isEffectiveWidget(props)) {
      addUuidToObj(props);
      return <ContextBox data={props} key={props.uuid} index={preIndex} />;
    }

    if (React.isValidElement<TDataSource>(props)) {
      return props;
    }

    if (typeof props === 'string') {
      return props;
    }

    if (typeof props === 'number') {
      return props;
    }
  }

  return null;
}
import React, { isValidElement, PureComponent } from 'react';
import classnames from 'classnames';
import { isEffectiveWidget, AnalysisEngine, TDataSource } from '../../index';
import { isObject } from '../../utils/tools';

export interface ICellProps {
  prefixCls?: string;
  className?: string;
  label?: string | TDataSource;
  help?: string;
  description?: string | TDataSource;
  descriptionStyle?: React.CSSProperties;
  forwardRef?: React.RefObject<any>;
  children?: React.ReactNode;
  labelStyle?: React.CSSProperties;
  extra?: string | TDataSource;
}

export function getLabel(label: any, preIndex?: number): React.ReactNode | null {
  if (isObject(label)) {
    if (isValidElement(label)) {
      return label;
    } else if (isEffectiveWidget(label)) {
      return <AnalysisEngine key={preIndex} dataSource={label as TDataSource} embed />
    }
    return null;
  }

  if (Array.isArray(label)) {
    return label.map((itemLabel, index) => {
      return getLabel(itemLabel, index);
    })
  }

  return label;
}

export function isCanRender(obj: any) {
  if (isObject(obj)) {
    return true;
  }

  if (Array.isArray(obj) && obj.length > 0) {
    return true;
  }

  if ((typeof obj === 'string' && obj) || typeof obj === 'number') {
    return true;
  }
}

class Cell extends PureComponent<ICellProps, {}> {
  static defaultProps = {
    prefixCls: 'cre-cell',
    className: undefined,
    label: undefined,
    help: undefined,
    forwardRef: undefined,
  };

  render() {
    const { prefixCls, forwardRef, description, descriptionStyle, labelStyle, label, extra, help, className, children } = this.props;
    const cellcls = classnames(prefixCls, className);
    const cellinnercls = classnames(`${prefixCls}-inner`);

    return (
      <div className={cellcls} ref={forwardRef}>
        <div className={cellinnercls}>
          {
            isCanRender(label)
            && (<div style={labelStyle} className={`${prefixCls}-inner-label`}>{getLabel(label)}</div>)
          }
          <div className={`${prefixCls}-inner-content`}>{children}</div>
          {
            isCanRender(description)
            && (<div style={descriptionStyle} className={`${prefixCls}-inner-description`}>{getLabel(description)}</div>)
          }
        </div>
        {
          help
          && (
            <div className={`${prefixCls}-help`}>
              <div className={`${prefixCls}-message`}>
                <svg
                  width="1em"
                  height="1em"
                  viewBox="0 0 1000 1000"
                  fill="currentColor"
                  focusable="false"
                  aria-hidden="true"
                >
                  <g fillRule="evenodd">
                    <g>
                      <path d="M499.938 937.383c241.594 0 437.445-195.851 437.445-437.445 0-241.595-195.851-437.446-437.445-437.446-241.595 0-437.446 195.851-437.446 437.446 0 241.594 195.851 437.445 437.446 437.445zm0 62.492C223.83 999.875 0 776.045 0 499.938 0 223.83 223.83 0 499.938 0c276.107 0 499.937 223.83 499.937 499.938 0 276.107-223.83 499.937-499.937 499.937z" fillRule="nonzero" />
                      <path d="M459.326 227.299c-.144-6.462 4.47-11.701 11.242-11.701h64.988c6.353 0 11.394 4.913 11.242 11.7l-9.254 414.045c-.144 6.462-5.632 11.7-11.563 11.7h-45.838c-6.241 0-11.411-4.912-11.563-11.7l-9.254-414.044zm43.736 556.978c-24.16 0-43.744-19.585-43.744-43.745 0-24.159 19.585-43.744 43.744-43.744 24.16 0 43.745 19.585 43.745 43.744 0 24.16-19.585 43.745-43.745 43.745z" />
                    </g>
                  </g>
                </svg>
                <div className={`${prefixCls}-message-content`}>{help}</div>
              </div>
            </div>
          )
        }
        {
          isCanRender(extra) && (
            <div>{getLabel(extra)}</div>
          )
        }
      </div>
    );
  }
}

export default Cell;
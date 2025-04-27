import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { getLabel, isCanRender } from './appcell';
import { TDataSource } from '../../index';

export interface ICellProps {
  prefixCls?: string;
  className?: string;
  label?: string | TDataSource;
  help?: string;
  required?: boolean;
  forwardRef?: React.RefObject<any>;
  labelCol?: {
    span: number;
  };
  wrapperCol?: {
    span: number;
  };
  description?: string | TDataSource;
  descriptionStyle?: React.CSSProperties;
  extra?: string | TDataSource;
  children?: React.ReactNode;
}

function isNumber(number: any) {
  return Reflect.toString.call(number) === '[object Number]';
}

class Cell extends PureComponent<ICellProps, {}> {
  ref = React.createRef<any>();

  preRef = React.createRef<any>();

  static defaultProps = {
    prefixCls: 'cre-pc-cell',
    className: undefined,
    label: undefined,
    help: undefined,
    required: false,
    forwardRef: undefined,
    labelCol: undefined,
    wrapperCol: undefined,
  };

  render() {
    const { prefixCls, labelCol, description, extra, wrapperCol, required, forwardRef, label, help, className, children } = this.props;
    const cellcls = classnames(prefixCls, className, {
      [`${prefixCls}-error`]: !!help,
    });
    const labelSpan = +(labelCol?.span as Number);
    const wrapSpan = +(wrapperCol?.span as Number);
    const labcls = classnames(`${prefixCls}-label`, {
      [`${prefixCls}-label-required`]: required,
      [`${prefixCls}-label-${labelCol?.span}`]: isNumber(labelSpan) && labelSpan >= 0,
    });
    const wrapcls = classnames(`${prefixCls}-content`, {
      [`${prefixCls}-wrap-${wrapperCol?.span}`]: isNumber(wrapSpan) && wrapSpan >= 0,
    });

    return (
      <div className={cellcls} ref={forwardRef}>
        {
          isCanRender(label)
          && (
            <div className={labcls}>
              <label>
                {getLabel(label)}：
              </label>
            </div>
          )
        }
        <div className={wrapcls}>
          <div className={`${prefixCls}-form-content`}>
            {children}
            {
              isCanRender(description)
              && (
                <div className={labcls}>
                  {getLabel(description)}：
                </div>
              )
            }
          </div>
          {
            help
            && (
              <div ref={this.ref} className={`${prefixCls}-message`}>
                <div className={`${prefixCls}-message-content`}>{help}</div>
              </div>
            )
          }
          {
            isCanRender(extra) && (
              <div>{getLabel(extra)}</div>
            )
          }
        </div>
      </div>
    );
  }
}

export default Cell;
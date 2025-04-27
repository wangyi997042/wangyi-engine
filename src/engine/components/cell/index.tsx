import React, { PureComponent } from 'react';
import PCCell from './pccell';
import APPCell from './appcell';
import { TDataSource } from '../../index';

export interface ICellProps {
  className?: string;
  label?: string | TDataSource;
  help?: string;
  type: string;
  required?: boolean;
  noStyle?: boolean;
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
  labelStyle?: React.CSSProperties;
  children?: React.ReactNode;
}

class Cell extends PureComponent<ICellProps, {}> {
  static defaultProps = {
    className: undefined,
    label: undefined,
    help: undefined,
    forwardRef: undefined,
    required: undefined,
    noStyle: undefined,
    labelCol: undefined,
    wrapperCol: undefined,
  };

  render(): any {
    const { type, noStyle, forwardRef, children } = this.props;

    if (noStyle) {
      return <div ref={forwardRef}>{children}</div>;
    }

    return type === 'pc' ? (
      <PCCell {...this.props} />
    ) : (
      <APPCell {...this.props} />
    );
  }
}

export default Cell;
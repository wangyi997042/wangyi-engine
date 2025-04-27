import React, { PureComponent, CSSProperties } from 'react';
import classnames from 'classnames';
import { BaseModalBodyProps } from './PropsType';

export interface ModalBodyProps extends BaseModalBodyProps {
  prefixCls?: string;
  className: string;
  children?: React.ReactNode;
}

export default class ModalBody extends PureComponent<ModalBodyProps, {}> {
  static defaultProps = {
    prefixCls: 'cre-modal',
  };

  render() {
    const { prefixCls, className, height, children, ...others } = this.props;
    const cls = classnames(`${prefixCls}-body`, className);

    const bodyStyle: CSSProperties = {};
    bodyStyle.height = height;

    return (
      <div className={cls} style={bodyStyle} {...others}>
        {children}
      </div>
    );
  }
}

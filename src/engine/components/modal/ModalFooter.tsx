import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { BaseModalFooterProps } from './PropsType';

export interface ModalFooterProps extends BaseModalFooterProps {
  prefixCls?: string;
  className: string;
  children?: React.ReactNode;
}

export default class ModalFooter extends PureComponent<ModalFooterProps, {}> {
  static defaultProps = {
    prefixCls: 'cre-modal',
  };

  render() {
    const { prefixCls, className, block, children, ...others } = this.props;
    const cls = classnames(`${prefixCls}-footer`, className, {
      [`${prefixCls}-footer-block`]: block,
    });

    return (
      <div className={cls} {...others}>
        {children}
      </div>
    );
  }
}

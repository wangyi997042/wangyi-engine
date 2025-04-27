import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { BaseModalHeaderProps } from './PropsType';
// import Icon from '../icon';

export interface ModalHeaderProps extends BaseModalHeaderProps {
  prefixCls?: string;
  className: string;
}

export default class ModalHeader extends PureComponent<ModalHeaderProps, {}> {
  static defaultProps = {
    prefixCls: 'cre-modal',
  };

  render() {
    const { prefixCls, className, title, closable, onClose, ...others } = this.props;
    const cls = classnames(`${prefixCls}-header`, className);
    const btnClose = closable && <span className={`${prefixCls}-header-close`} onClick={onClose} />;
    return (
      <div className={cls} {...others}>
        <div className={`${prefixCls}-header-title`}>{title}</div>
        {btnClose}
      </div>
    );
  }
}

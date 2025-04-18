import React, { Component } from 'react';
import classnames from 'classnames';
import { BaseModalProps } from './PropsType';
import LockScroll from '../lockScroll';
import Popup from '../popup';

export interface ModalProps extends BaseModalProps {
  prefixCls?: string;
  className?: string;
}

export default class Modal extends Component<ModalProps, any> {
  static Header: any;

  static Body: any;

  static Footer: any;

  static defaultProps = {
    prefixCls: 'cre-modal',
    visible: false,
    animationType: 'fade',
    animationDuration: 200,
    width: '70%',
    shape: 'radius',
  };

  onCancel() {
    const { onMaskClick } = this.props;

    onMaskClick && onMaskClick();
  }

  render() {
    const { prefixCls, className, shape, children, ...others } = this.props;

    const cls = {
      modal: classnames(prefixCls, className, {
        [`${prefixCls}--${shape}`]: !!shape,
      }),
      dialog: classnames(`${prefixCls}__dialog`),
    };

    return (
      <LockScroll>
        <Popup
          className={cls.modal}
          direction="center"
          onMaskClick={() => this.onCancel()}
          {...others}
        >
          <div className={cls.dialog}>
            {children}
          </div>
        </Popup>
      </LockScroll>
    );
  }
}

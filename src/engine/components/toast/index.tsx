import React, { Component } from 'react';
import classnames from 'classnames';
import PropsType from './PropsType';
import Popup from '../popup';

export interface ToastProps extends PropsType {
  prefixCls?: string;
  className?: string;
  children?: React.ReactNode;
}

export default class Toast extends Component<ToastProps, any> {
  static defaultProps = {
    prefixCls: 'cre-toast',
    visible: false,
    stayTime: 3000,
    mask: false,
  };

  state = {
    visible: this.props.visible,
  };

  timer?: NodeJS.Timeout;

  componentDidMount() {
    this.autoClose();
  }

  componentWillReceiveProps(nextProps: ToastProps) {
    const { visible } = this.props;

    if (nextProps.visible !== visible) {
      if (nextProps.visible === true) {
        this.setState({
          visible: true,
        });
        this.autoClose();
      } else {
        this._hide();
      }
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  afterClose = () => {
    const { afterClose } = this.props;

    if (typeof afterClose === 'function') {
      afterClose();
    }
  };

  _hide = () => {
    this.afterClose();

    this.setState({
      visible: false,
    });
  };

  autoClose() {
    const { stayTime } = this.props;
    if (stayTime && stayTime > 0) {
      this.timer = setTimeout(() => {
        this._hide();
        clearTimeout(this.timer);
      }, stayTime);
    }
  }

  render() {
    const {
      prefixCls,
      className,
      stayTime,
      children,
      ...others
    } = this.props;

    const { visible } = this.state;

    const cls = classnames(prefixCls, className);

    return (
      <Popup
        direction="center"
        maskType="transparent"
        width="70%"
        {...others}
        className={`${prefixCls}-popup`}
        visible={visible}
        afterClose={this.afterClose}
      >
        <div className={cls}>
          <div className={`${prefixCls}-container`}>{children}</div>
        </div>
      </Popup>
    );
  }
}

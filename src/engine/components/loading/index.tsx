import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropsType from './PropsType';
import Toast from '../toast';
import ActivityIndicator from '../activity-indicator';

export interface LoadingProps extends PropsType {
  prefixCls?: string;
  className?: string;
  mask?: boolean;
  children?: React.ReactNode;
}

export default class Loading extends PureComponent<LoadingProps, {}> {
  static defaultProps = {
    prefixCls: 'cre-loading',
    className: undefined,
    mask: true,
  };

  static creLoading: null | HTMLElement;

  static _hide: () => void;

  static show = (children?: any, stayTime?: number, mask?: boolean, afterClose?: () => void) => {
    Loading.unmountNode();
    if (!Loading.creLoading) {
      Loading.creLoading = document.createElement('div');
      document.body.appendChild(Loading.creLoading);
    }
    if (Loading.creLoading) {
      ReactDOM.render(
        <Loading visible stayTime={stayTime} mask={mask} afterClose={afterClose}>
          {children}
        </Loading>,
        Loading.creLoading,
      );
    }
  };

  static hide = () => {
    if (Loading._hide) {
      Loading._hide();
    }
  };

  static unmountNode = () => {
    const { creLoading } = Loading;
    if (creLoading) {
      ReactDOM.unmountComponentAtNode(creLoading);
    }
  };

  private timer?: NodeJS.Timeout;

  state = {
    visible: this.props.visible,
  };

  componentDidMount() {
    Loading._hide = this._hide;
    this.autoClose();
  }

  componentWillReceiveProps(nextProps: LoadingProps) {
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
    if (Loading.creLoading) {
      document.body.removeChild(Loading.creLoading);
      Loading.creLoading = null;
    }

    if (typeof afterClose === 'function') {
      afterClose();
    }
  };

  _hide = () => {
    this.setState({
      visible: false,
    });

    this.afterClose();
  };

  autoClose() {
    const { stayTime } = this.props;

    if ((stayTime as number) > 0) {
      this.timer = setTimeout(() => {
        this._hide();
        clearTimeout(this.timer);
      }, stayTime);
    }
  }

  render() {
    const { prefixCls, children, stayTime, ...others } = this.props;
    const { visible } = this.state;
    return (
      <Toast prefixCls={prefixCls} stayTime={stayTime || 0} {...others} visible={visible} afterClose={this.afterClose}>
        {children || <ActivityIndicator type="spinner" size="lg" />}
      </Toast>
    );
  }
}

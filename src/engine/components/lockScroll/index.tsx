import React from 'react';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from './bodyScroll';

export interface ILockScroll {
  visible?: boolean;
  children: React.ReactElement
}

const getPropsVisible = (props: ILockScroll) => {
  const { visible: componentVisible, children } = props;
  let childrenVisible = false;
  if (componentVisible === undefined) {
    if (Array.isArray(children)) {
      childrenVisible = children.some((item) => item.props.visible);
    }
    if (children.props) {
      childrenVisible = children.props.visible;
    }
    return childrenVisible;
  }
  childrenVisible = componentVisible;

  return childrenVisible;
};

class LockScroll extends React.PureComponent<ILockScroll> {
  dom: HTMLDivElement;

  constructor(props) {
    super(props);
    this.dom = document.createElement('div');
  }

  componentWillUnmount() {
    this.removeDom();
    clearAllBodyScrollLocks();
  }

  setLock = () => {
    const visible = getPropsVisible(this.props);
    const { dom } = this;
    if (visible) {
      document.body.appendChild(dom);
      disableBodyScroll(dom, {
        allowTouchMove: (el) => {
          while (el && el !== document.body) {
            const { className } = el;
            if (className && (
              className.indexOf('za-modal__dialog') > 0
              || className.indexOf('za-modal__body') > 0
              || className.indexOf('za-popup--show') > 0
            )) {
              return true;
            }
            el = el.parentElement;
          }
        },
      });
    } else {
      enableBodyScroll(dom);
      this.removeDom();
    }
  };

  removeDom = () => {
    const { dom } = this;
    if (dom && dom.parentNode) {
      dom.parentNode.removeChild(dom);
    }
  };

  render() {
    const { children } = this.props;
    if (!children) {
      return null;
    }
    this.setLock();
    return children;
  }
}

export default LockScroll;

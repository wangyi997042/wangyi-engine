import React, { PureComponent } from 'react';
import Portal, { PortalProps } from './Portal';

export default class Popup extends PureComponent<PortalProps, any> {
  constructor(props: PortalProps) {
    super(props);
    this.state = {
      renderPortal: true,
    };
    this.handlePortalUnmount = this.handlePortalUnmount.bind(this);
  }

  componentWillReceiveProps(nextProps: PortalProps) {
    const { visible } = this.props;

    if (nextProps.visible !== visible && nextProps.visible === true) {
      this.setState({
        renderPortal: true,
      });
    }

    if (nextProps.visible !== visible && nextProps.visible === false) {
      this.setState({
        renderPortal: false,
      });
    }
  }

  handlePortalUnmount() {
    this.setState({
      renderPortal: false,
    });
  }

  render() {
    const { renderPortal } = this.state;

    if (renderPortal) {
      return <Portal {...this.props} handlePortalUnmount={this.handlePortalUnmount} />;
    }

    return renderPortal;
  }
}

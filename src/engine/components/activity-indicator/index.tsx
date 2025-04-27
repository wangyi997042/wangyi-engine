import React, { PureComponent } from 'react';
import classnames from 'classnames';
import PropsType from './PropsType';

const DIAMETER = 62;

export interface ActivityIndicatorProps extends PropsType {
  prefixCls?: string;
  className?: string;
}

const Circular = (props: ActivityIndicatorProps) => {
  const { prefixCls, className, size, percent, strokeWidth, loading } = props;
  const cls = classnames(className, `${prefixCls}`, {
    [`${prefixCls}-${size}`]: !!size,
    [`${prefixCls}-circular-loading`]: loading,
  });

  const half = DIAMETER / 2;
  const r = half - (strokeWidth as number / 2);
  const round = 2 * Math.PI * r;
  const style = {
    strokeDasharray: `${(round * (percent as number)) / 100} ${round}`,
    strokeWidth,
  };

  if (loading) {
    const circularCls = classnames({
      [`${prefixCls}-circular`]: !size,
      [`${prefixCls}-circular-${size}`]: !!size,
    });

    return (
      <span className={cls}>
        <svg viewBox={`${DIAMETER / 2} ${DIAMETER / 2} ${DIAMETER} ${DIAMETER}`} className={circularCls}>
          <circle cx={DIAMETER} cy={DIAMETER} r={r} fill="none" style={{ strokeWidth }} />
        </svg>
      </span>
    );
  }

  return (
    <svg className={cls} viewBox={`0 0 ${DIAMETER} ${DIAMETER}`}>
      <circle className={`${prefixCls}-path`} cx={half} cy={half} r={r} fill="none" style={{ strokeWidth }} />
      <circle className={`${prefixCls}-line`} cx={half} cy={half} r={r} fill="none" style={style} />
    </svg>
  );
};

const Spinner = (props: ActivityIndicatorProps) => {
  const { prefixCls, className, size } = props;
  const cls = classnames(prefixCls, `${prefixCls}-spinner`, className, {
    [`${prefixCls}-${size}`]: !!size,
  });
  const spinner: any[] = [];

  for (let i = 0; i < 12; i++) {
    spinner.push(<div key={i} />);
  }

  return (
    <div className={cls}>{spinner}</div>
  );
};

export default class ActivityIndicator extends PureComponent<ActivityIndicatorProps, any> {
  static defaultProps = {
    prefixCls: 'cre-activity-indicator',
    strokeWidth: 5,
    percent: 20,
    type: 'circular',
    loading: true,
  };

  render() {
    const { type } = this.props;
    return (type !== 'spinner' ? <Circular {...this.props} /> : <Spinner {...this.props} />);
  }
}

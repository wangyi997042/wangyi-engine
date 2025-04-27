import React from "react";

export default function Page (props: any) {
  const {
    children
  } = props;

  return (<div>
    <div>
      {props.label}
    </div>
    <div>{children}</div>
  </div>);
}

import React from "react";
import { Button } from "antd";

export default function(props: any) {
  console.log(props);
  
  return (
    <Button {...props}>
      {props.label}
    </Button>
  )
}
import React from "react";
import { Card } from "antd";

export default function(props: any) {
  console.log(props);
  
  return (
    <Card {...props} />
  )
}
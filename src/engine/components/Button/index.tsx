import React from 'react'
import { Divider, Space, Button } from 'antd-mobile'

export default function WButton(props) {
  const { _crengine, action } = props;
  console.log(action);
  const onClick = () => {
    _crengine && _crengine.action(action[0])
    console.log('按钮被点击了', _crengine);
  }
  return (
    <>
    <Divider contentPosition='right'>右1侧内容</Divider>
    <Button onClick={onClick} {...props}>{props.label}</Button>
    </>
  ) 
}
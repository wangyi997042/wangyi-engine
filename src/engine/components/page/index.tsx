import { Divider, Space } from 'antd-mobile'

export default function Page(props) {
  const { children } = props;
  return (
    <div>
      <Divider contentPosition='right'>右侧2内容</Divider>
      {children}
    </div>
  )
}
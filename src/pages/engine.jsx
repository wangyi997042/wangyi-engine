import { Button, Form } from "antd"
import {
  Page
} from '../engine/components/index'
import { renderEngine } from "../engine/index"

export default function engine() {
  const [form] = Form.useForm();
  const dataSource = {
    "widget": "Button",
    "children": []
}
  // 参数
  const options = {
    components: {Button, Page},
    form,
    params: { 'dd': 11 }
};



const onChange = (v) => {
  console.log(v);
  
}
// 事件监听
const events = {
    // onChange
};


return renderEngine(dataSource, options, events);

}
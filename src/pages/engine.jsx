import { Form } from "antd"
import {
  Page,
  Button
} from '../engine/components/index'
import { renderEngine, registerAction } from "../engine/index"

export default function engine() {
  const [form] = Form.useForm();
  const dataSource = {
    "widget": "Page",
    "childrens": [
      {
        "widget": "button",
        "wprops": {
          "type": "primary",
          "label": "按钮"
        },
        action: [
          {
            type: 'submit2222',
            data: { 'aa': 22 }
          }
        ]
      }
    ]
  }
  // 参数
  const options = {
    components: { Button, Page },
    form,
    params: { 'dd': 11 }
  };



  const submit2222 = (v, d = () => {}) => {
    console.log(23, v, d({ee: 33}));

  }

  registerAction({submit2222})
  // 事件监听
  const events = {
    // onChange
  };


  return renderEngine(dataSource, options, events);

}
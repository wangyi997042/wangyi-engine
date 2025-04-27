import { Button } from "antd"
import {
  Page,
  Card
} from '../engine/components/index'
import { renderEngine, AnalysisEngine } from "../engine/index"


export default function engine() {
  // const [form] = Form.useForm();
  const item = {
    widget: 'page',
    wprops: {
      label: '测试代码',
    },
    childrens: [
      {
        widget: 'card',
        wprops: {
          label: '测试卡片',
          title: '测试标题',
        },
      },
      {
        widget: 'button',
        wprops: {
          label: '测试按钮',
          type: 'primary',
        },
      }
    ]
  };
  const options = {
    components: {
      Page,
      Card,

      Button
    },
  };

  return <AnalysisEngine dataSource={item} options={options} />;
}
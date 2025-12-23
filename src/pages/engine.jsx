// import { Button } from "antd"
import {
  Page,
  Card,
  Button
} from '../engine/components/index'
import { renderEngine, AnalysisEngine } from "../engine/index"


export default function engine() {
  // const [form] = Form.useForm();
  const dataSource = {
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
        action: [
          {
            type: 'copy',
            data: {
              text: '一段内容',
            },
          },
          {
            type: 'toast',
            data: {
              message: '复制成功',
            },
          },
        ],
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

  return <>
    <AnalysisEngine
      dataSource={dataSource}
      options={options}
    >
      <div>
        子节点
      </div>
    </AnalysisEngine>
  </>
}
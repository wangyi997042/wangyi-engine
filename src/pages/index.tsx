import React from 'react';

import {getWidgetList} from "@/api/index"

export default function HomePage() {
  // const { data, error, loading } = useRequest(() => {
  //   return getWidgetList();
  // });

  const dataSource = {
    "widget": "page",
    "childrens": [
      {
        "widget": "input",
        "name": "name",
        "wprops": {
          "label": "姓名",
          "placeholder": "请输入",
          "validate": {
            "rules": [
              {
                "message": "请输入姓名",
                "required": true
              },
              {
                "pattern": "^[^\\!\\@\\#\\$\\%\\`\\^\\&\\*0-9]{2,}$",
                "message": "字数过少或有特殊符号"
              }
            ]
          }
        }
      }
    ]
  }

  return (
    <div>
      <h2>Yay! Welcome to umi!</h2>
    </div>
  );
}

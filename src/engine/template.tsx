import React from 'react';

import { isObject, isInApp, isIOS, uuid } from './utils/tools';
import { tips, copy } from './action';

// 兼容pc 渲染问题 \\"
/* eslint-disable no-useless-escape */
const REG_TPL = /<(?=[div|p|span|strong|link|file|tel|modal|copy])([\s\S]+?)>([\s\S]*?)<\/([\\"\w]+?)>/g;
const REG_TAG = /([a-zA-z]+)\s*(.*)/;
const REG_VALUE = /{{(.*?)}}/g;
// const REG_JS = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g;
const REG_JS = /^(.*)?(\|\|)(.*)?/g;
const REG_BR = /([\s\S]*?)(<br[\s\/]*>|\\n)/gi;

// 标签保留字段
const tagReserved: string[] = [
  'p', 'span', 'strong', 'link', 'tel', 'file', 'modal', 'copy',
];

// 属性保留字段
const attrReserved: string[] = [
  'href', 'style', 'className', 'target', 'label', 'value',
];

/**
 * 转义字符串
 * @param {string} text 内容
 */
const stringifyHTML = (text: string) => {
  return text.replace(/\r?\n/g, '\\n');
};

/**
 * 解析属性
 * @param text 文本
 */
const parseAttr = (text: string): any => {
  if (!text) {
    return {};
  }

  const attrs = {};

  text
    // style={"color": "red"}
    .replace(/([a-zA-z]+)=({.+?})/g, (
      _and: string,
      attr: string,
      value: string,
    ): any => {
      if (attr && attrReserved.indexOf(attr) > -1 && value) {
        // style={'color': 'red'} 替换 style={"color": "red"}
        /* eslint-disable no-useless-escape */
        value = value.replace(/\'/g, '\"');
        attrs[attr] = JSON.parse(value);
      }
    })
    .replace(/([a-zA-z]+)=["'](.*?)["']/g, (
      _and: string,
      attr: string,
      value: string,
    ): any => {
      if (attr && attrReserved.indexOf(attr) > -1) {
        attrs[attr] = value;
      }
    });

  return attrs;
};

/**
 * 换行 <br /> | \r\n
 * @param {string} tpl  模块
 * return any[]
 */
const lineBreak = (tpl: string) => {
  if (tpl && (tpl.match(REG_BR) || []).length) {
    const parseDOM: any[] = [];
    let placeIndex: number = 0;

    tpl.replace(REG_BR, (
      and: string,
      start: string,
      _tag: string,
      index: number,
    ): any => {
      const _id = uuid();

      if (start !== '') {
        parseDOM.push(start);
      }

      parseDOM.push(<br key={_id} />);

      placeIndex = (index + and.length);
    });

    // 不齐尾部文字
    if (placeIndex < tpl.length) {
      parseDOM.push(tpl.slice(placeIndex, tpl.length));
    }

    return parseDOM;
  }

  return tpl;
};

/**
 * 渲染标签
 * @param text  文字
 * @param startTag   标签内容
 */
const renderTag = (text: string, startTag: string): any => {
  let parseTag: any = null;

  if (!startTag) {
    return text;
  }

  // 字符串转义
  startTag = stringifyHTML(startTag);

  startTag.replace(REG_TAG, (
    _and: string,
    tag: string,
    attr: string,
  ): any => {
    if (tagReserved.indexOf(tag) > -1) {
      const _id = uuid();
      const attrs: any = parseAttr(attr);
      const { href, label, value, target, ...others } = attrs;

      switch (tag) {
        // 换行
        case 'p':
          parseTag = <p key={_id} {...others}>{text}</p>;
          break;
        // 行元素
        case 'span':
          parseTag = <span key={_id} {...others}>{text}</span>;
          break;
        // 链接，文件
        case 'link':
        case 'file':
          // app内 ios A标签属性有target="_blank"，打不开兼容
          if (target && !(isInApp && isIOS)) {
            others.target = target;
          }

          parseTag = <a key={_id} href={href} {...others}>{text}</a>;
          break;
        // 链接，文件
        case 'tel':
          parseTag = <a key={_id} href={`tel: ${href}`} {...others}>{text}</a>;
          break;
        // 加粗
        case 'strong':
          parseTag = <strong key={_id} {...others}>{text}</strong>;
          break;
        // 提示层
        case 'modal':
          // eslint-disable-next-line
          parseTag = <a key={_id} href="javascript:" onClick={() => tips(lineBreak(value), label)} {...others}>{text || label}</a>;
          break;
        // 提示层
        case 'copy':
          // eslint-disable-next-line
          parseTag = <a key={_id} href="javascript:" onClick={() => copy({text: value})} {...others}>{text || label}</a>;
          break;
        default:
          break;
      }
    }
  });

  return parseTag;
};

/**
 * 作用域值
 * 对象错误，语法错误直接报错xx.0.xx 替换xx[0].xx
 * @param {string} key 值
 * return string
 */
const scopeValue = (key: string) => {
  if (!key) {
    return '';
  }

  key = `__${key}`;

  return key.replace(/\.(\d+)/g, '[$1]');
};

/**
 * 作用域数据
 * @param {any} data 数据
 * return any
 */
const scopeData = (data: any) => {
  if (data && isObject(data)) {
    Object.keys(data).forEach((key) => {
      if (!(/^__.*/.test(key) && data[key] !== data[`__${key}`])) {
        data[`__${key}`] = data[key];
      }
    });

    return data;
  }

  return data || {};
};

/**
 * 编译
 * @param {string} tpl  文本
 * @param {object} data 数据
 */
const compile = (tpl: string, data: any) => {
  if (!tpl) {
    return tpl;
  }

  let match: any;
  let code: string = 'var __code__ = [];\nwith (__data__) {\n';
  let placeIndex: number = 0;

  // 解析html
  function parseHTML(line: string) {
    line = line.replace(/('|")/g, '\\$1').replace(/\n/g, ' ').replace(/(^\s+)|(\s+$)/g, '');

    if (line) {
      code += `__code__.push("${line}");\n`;
    }
  }

  // 解析JS代码
  function parseJS(line: string) {
    line = line.replace(/(^\s+)|(\s+$)/g, '');

    if (line) {
      // code += (line.match(REG_JS) ? `${line}\n` : `__code__.push(${line});\n`);
      // name || 'ss'
      if (line.match(REG_JS)) {
        line.replace(REG_JS, (
          _and: string,
          value: string,
          _handlers: string,
          defaultValue: string,
        ): any => {
          code += 'try {\n';
          code += `if (typeof ${scopeValue(value)} !== 'undefined') {\n`;
          code += `__code__.push(${scopeValue(value)} || ${defaultValue});\n`;
          code += `} else if (typeof ${defaultValue} !== 'undefined') {\n`;
          code += `__code__.push(${defaultValue});\n`;
          code += '}\n} catch(error) {\n';
          code += `__code__.push(typeof ${defaultValue} !== 'undefined' ? ${defaultValue} : '');\nconsole.error(error);\n};\n`;
        });
      } else {
        code += `__code__.push(typeof ${scopeValue(line)} !== 'undefined' ? ${scopeValue(line)} : '');\n`;
      }
    }
  }

  /* eslint-disable-next-line */
  while (match = REG_VALUE.exec(tpl)) {
    parseHTML(tpl.slice(placeIndex, match.index));
    parseJS(match[1]);

    placeIndex = (match.index + match[0].length);
  }

  // 补全尾部
  if (placeIndex < tpl.length) {
    parseHTML(tpl.substr(placeIndex));
  }

  code += '};\n return __code__.join("");';

  /* eslint-disable-next-line */
  return new Function('__data__', code.replace(/[\r\t\n]/g, ''))(scopeData(data));
};

/**
 * 模板渲染
 * @param tpl   文字
 * @param _data 数据
 */
const template = (tpl: string, data?: any) => {
  if (!tpl) {
    return '';
  }

  const parseDOM: any[] = [];
  let placeIndex: number = 0;

  // 替换value
  if ((tpl.match(REG_VALUE) || []).length) {
    try {
      tpl = compile(tpl, data);
    } catch (error) {
      console.error('template compile error', error);
    }
  }

  try {
    if (REG_TPL.test(tpl)) {
      tpl.replace(REG_TPL, (
        and: string,
        startTag: string,
        text: string,
        endTag: string,
        index: number,
      ): any => {
        const extractStart = tpl.slice(placeIndex, index);
        const startTpl = (extractStart || null);

        // 匹配开头文字
        if (startTpl) {
          parseDOM.push(lineBreak(startTpl));
        }

        // 标签渲染，包含文字
        if (startTag) {
          // 头尾标签必须相同
          if (startTag.indexOf(endTag) > -1) {
            parseDOM.push(renderTag(text, startTag));
          } else if (text) {
            parseDOM.push(text);
          }
        }

        placeIndex = (index + and.length);
      });

      // 不齐尾部文字
      if (placeIndex < tpl.length) {
        const parseText = tpl.slice(placeIndex, tpl.length);
        parseDOM.push(lineBreak(parseText));
      }

      return <span>{parseDOM}</span>;
    // 文字无解析标签
    } if ((tpl.match(REG_BR) || []).length) {
      return <span>{lineBreak(tpl)}</span>;
    }
  } catch (error) {
    console.error('parse template error', error);
  }

  return tpl;
};

export default template;

import oldactions from './oldaction';
import * as actions from './actions';
import * as formactions from './formactions';
import preValidate from '../preValidate';

export { registerAction, _runAction, runActions, useActions } from './tools';
export type { ActionProps, TActionsProps, FetchProps, ActionCallabck, IActionOption } from './types';

let root: any = {};

if (typeof window !== 'undefined') {
  root = window;
}

const ActionConfig: any = {
  ...oldactions,
  ...actions,
  ...formactions,
  'pre-validate': preValidate,
};

// 注入全局变量
root.CRE_ACTION = ActionConfig;

export default ActionConfig;

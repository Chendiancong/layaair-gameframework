import { uiHelper } from './core/UIHelper';
export { UIHelper, uiHelper, IViewRegOption } from './core/UIHelper';
export { UIView, UIPanel, UIComp } from './core/UIView';
export { IViewLayerConfig, BaseViewLayerMgr } from "./core/ViewLayerMgr";

const decorators = uiHelper.decorators;
export const xview = decorators.view.bind(decorators);
export const xprop = decorators.prop.bind(decorators);
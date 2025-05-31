import { uiHelper } from './core/UIHelper';
export { UIHelper, uiHelper, IViewRegOption } from './core/UIHelper';
export { UIView, UIPanel, UISubView as UIComp } from './core/UIView';
export { IViewLayerConfig, BaseViewLayerMgr } from "./core/ViewLayerMgr";

const decorators = uiHelper.decorators;
export const asView = decorators.view.bind(decorators);
export const asProp = decorators.prop.bind(decorators);
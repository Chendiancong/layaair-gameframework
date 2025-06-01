import { UIDecorator } from './core/UIHelper';
export { UIHelper, IViewRegOption, UIDecorator } from './core/UIHelper';
export { UIView, UIPanel, UISubView as UIComp } from './core/UIView';
export { IViewLayerConfig, BaseViewLayerMgr } from "./core/ViewLayerMgr";

const decorators = UIDecorator.ins;
export const asView = decorators.view.bind(decorators);
export const asProp = decorators.prop.bind(decorators);
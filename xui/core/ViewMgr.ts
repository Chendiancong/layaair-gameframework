import { uiHelper } from "./UIHelper";
import { UIPanel } from "./UIView";
import { BaseViewCtrl } from "./ViewCtrl";
import { BaseViewLayerMgr } from "./ViewLayerMgr";

export class ViewMgr {
    private _rootNode: Laya.Sprite;
    private _layerMgr: BaseViewLayerMgr;
    private _views: Record<string, BaseViewCtrl> = {};

    get rootNode() { return this._rootNode; }
    get layerMgr() { return this._layerMgr; }

    constructor(rootNode: Laya.Sprite, layerMgr: BaseViewLayerMgr) {
        this._rootNode = rootNode;
        this._layerMgr = layerMgr;
        layerMgr.setup(this);
    }

    open<T extends UIPanel>(viewClass: gFrameworkDef.Constructor<T>, ...arg: T['onOpen'] extends (..._arg: infer R) => any ? R : any) {
        const viewInfo = uiHelper.getViewInfo(viewClass);
    }
}
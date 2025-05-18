import { misc } from "../..";
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

    open<ViewClass extends UIPanel>(viewClass: gFrameworkDef.Constructor<ViewClass>, ...args: ViewClass['onOpen'] extends (..._args: infer R) => any ? R : any): Promise<ViewClass>;
    open(viewName: string, ...args: any[]): Promise<UIPanel>;
    open(arg0: string|gFrameworkDef.Constructor<UIPanel>, ...args: any[]): Promise<UIPanel> {
        const viewInfo = uiHelper.getViewInfo(arg0 as any);
        misc.logger.assert(viewInfo != void 0);
        const viewName = viewInfo.viewName;
        let ctrl = this._views[viewName];
        if (ctrl == void 0) {
            ctrl = new BaseViewCtrl(this, viewInfo);
            this._views[viewName] = ctrl;
        }
        return ctrl._open(...args);
    }

    close<ViewClass extends UIPanel>(viewClass: gFrameworkDef.Constructor<ViewClass>): void;
    close(viewName: string): void;
    close(arg0: string|gFrameworkDef.Constructor<UIPanel>): void {
        const viewInfo = uiHelper.getViewInfo(arg0 as any);
        misc.logger.assert(viewInfo != void 0);
        const viewName = viewInfo.viewName;
        const ctrl = this._views[viewName];
        ctrl?._close();
    }
}
import { misc } from "../..";
import { layaExtends } from "../../misc";
import { uiHelper } from "./UIHelper";
import { UIPanel } from "./UIView";
import { BaseViewCtrl } from "./ViewCtrl";
import { BaseViewLayerMgr } from "./ViewLayerMgr";

export class ViewMgr {
    private _rootNode: Laya.Sprite;
    private _layerMgr: BaseViewLayerMgr;
    private _viewCtrls: Record<string, BaseViewCtrl> = {};

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
        let ctrl = this._viewCtrls[viewName];
        if (ctrl == void 0) {
            ctrl = new BaseViewCtrl(this, viewInfo);
            this._viewCtrls[viewName] = ctrl;
        }
        return ctrl._open(...args);
    }

    openWithPrefab<ViewClass extends UIPanel>(prefab: Laya.Prefab, viewClass: gFrameworkDef.Constructor<ViewClass>, ...args: ViewClass['onOpen'] extends (..._args: infer R) => any ? R : any): Promise<ViewClass>;
    openWithPrefab(prefab: Laya.Prefab, viewName: string, ...args: any[]): Promise<UIPanel>;
    openWithPrefab(arg0: Laya.Prefab, arg1: string|gFrameworkDef.Constructor<UIPanel>, prefab: Laya.Prefab, ...args: any[]): Promise<UIPanel> {
        misc.logger.assert(layaExtends.isValid(arg0));
        const viewInfo = uiHelper.getViewInfo(arg1 as any);
        misc.logger.assert(viewInfo != void 0);
        const viewName = viewInfo.viewName;
        let ctrl = this._viewCtrls[viewName];
        if (ctrl == void 0) {
            ctrl = new BaseViewCtrl(this, viewInfo);
            this._viewCtrls[viewName] = ctrl;
        }
        return ctrl._openWithPrefab(prefab, ...args);
    }

    close<ViewClass extends UIPanel>(viewClass: gFrameworkDef.Constructor<ViewClass>): void;
    close(viewName: string): void;
    close(arg0: string|gFrameworkDef.Constructor<UIPanel>): void {
        const viewInfo = uiHelper.getViewInfo(arg0 as any);
        misc.logger.assert(viewInfo != void 0);
        const viewName = viewInfo.viewName;
        const ctrl = this._viewCtrls[viewName];
        ctrl?._close();
    }
}
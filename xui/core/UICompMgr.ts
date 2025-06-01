import { UIHelper } from "./UIHelper";
import { UISubView } from "./UIView";

export class UICompMgr implements gFrameworkDef.IDisposable {
    static readonly kUICompMgrKey = "$UICompMgr";
    private _sprite: Laya.Sprite;
    private _compList: UISubView[];

    constructor(sprite: Laya.Sprite) {
        this._sprite = sprite;
        this._compList = [];
        Reflect.set(this._sprite, UICompMgr.kUICompMgrKey, this)
    }

    dispose() {
        Reflect.deleteProperty(this._sprite, UICompMgr.kUICompMgrKey);
        const compList = this._compList.concat();
        this._compList.length = 0;
        compList.forEach(v => v._internalUninit());
    }

    addComp<T extends UISubView>(clazz: gFrameworkDef.Constructor<UISubView>): T;
    addComp<T extends UISubView = UISubView>(className: string): T;
    addComp(arg0: any): UISubView {
        const viewInfo = UIHelper.ins.getViewInfo(arg0);
        const comp = new viewInfo.viewClazz(this._sprite);
        this._compList.push(comp);
        comp._internalInit();
        return comp;
    }

    getComp<T extends UISubView>(clazz: gFrameworkDef.Constructor<UISubView>): T;
    getComp<T extends UISubView = UISubView>(className: string): T;
    getComp(arg0: any): UISubView {
        const viewInfo = UIHelper.ins.getViewInfo(arg0 as any);
        const comp = this._compList.find(v => v.viewName === viewInfo.viewName);
        return comp ?? void 0;
    }

    // #region static method
    static getMgr(sprite: Laya.Sprite, autoCreate?: boolean) {
        let mgr: UICompMgr = Reflect.get(sprite, UICompMgr.kUICompMgrKey);
        if (!mgr && autoCreate)
            mgr = new UICompMgr(sprite);
        return mgr;
    }

    static addComp<T extends UISubView>(target: Laya.Sprite, clazz: gFrameworkDef.Constructor<T>): T;
    static addComp<T extends UISubView = UISubView>(target: Laya.Sprite, className: string): T;
    static addComp(arg0: Laya.Sprite, arg1: any): UISubView {
        const mgr = this.getMgr(arg0, true);
        return mgr.addComp(arg1);
    }

    static getComp<T extends UISubView>(target: Laya.Sprite, clazz: gFrameworkDef.Constructor<T>): T;
    static getComp<T extends UISubView = UISubView>(target: Laya.Sprite, className: string): T;
    static getComp(arg0: Laya.Sprite, arg1: any): UISubView {
        const mgr = this.getMgr(arg0);
        return mgr?.getComp(arg1);
    }
    // #endregion
}
import { misc, ResInfo, ResKeeper, ResMgr } from "../..";
import { jsUtil, layaExtends } from "../../misc";
import { UICompMgr } from "./UICompMgr";
import { UIDecorator, UIHelper } from "./UIHelper";
import { IUITreeNode, UIParser } from "./UIParser";
import { BaseViewCtrl, ViewCtrl } from "./ViewCtrl";

export const enum InnerViewState {
    Init,
    Initing,
    AfterInit,
    Uniniting,
    Disposed
}

export abstract class UIView<Data = any> {
    protected _sprite: Laya.Sprite;
    protected _data: Data;
    protected _subViewList: UISubView[] = [];
    protected _innerState = InnerViewState.Init;
    protected _innerKeeper: ResKeeper;

    get data() { return this._data; }
    set data(val: Data) {
        if (this.isSameData && this.isSameData(this._data, val))
            return;
        this._data = val;
        this.onDataChange();
        this._sprite.event('DATA_CHANGED', this._data);
    }

    get asSprite() { return this._sprite; }
    get asNode() { return this._sprite as Laya.Node; }
    get isValid() { return layaExtends.isValid(this._sprite); }
    get viewName() { return (this as any)[UIDecorator.ins.viewNameKey] }

    constructor(sprite: Laya.Sprite) {
        this._sprite = sprite;
        this._innerKeeper = new ResKeeper();
    }

    /**
     * @deprecated internal
     */
    _internalInit() {
        if (this._innerState !== InnerViewState.Init)
            return;
        this._innerState = InnerViewState.Initing;
        const props = UIHelper.ins.getUIProps(this);
        for (const pName in props) {
            const prop = props[pName];
            let child: Laya.Sprite = null;
            if (prop.path)
                child = this.findChildByPath(prop.path);
            else
                child = this.findChildRecursive(pName);
            misc.logger.assert((!!child || prop.optional), pName);

            if (prop.type) {
                const viewInfo = UIHelper.ins.getViewInfo(prop.type as any);
                const ctor = viewInfo.viewClazz;
                const subView = new ctor(child);
                subView._internalInit();
                (this as any)[pName] = subView;
                this._subViewList.push(subView);
            } else {
                (this as any)[pName] = child;
            }

            if (prop.comps?.length) {
                for (const compType of prop.comps) {
                    const subView = UICompMgr.addComp(child, compType as any);
                    this._subViewList.push(subView);
                }
            }
        }
        this._innerState = InnerViewState.AfterInit;
        this.afterInit();
    }

    /**
     * @deprecated internal
     */
    _internalUninit() {
        if (this._innerState !== InnerViewState.AfterInit)
            return;
        this._innerState = InnerViewState.Uniniting;
        this.beforeUninit();
        const subViewList = this._subViewList.concat();
        this._subViewList.length = 0;
        subViewList.forEach(v => v._internalUninit());
        this._innerState = InnerViewState.Disposed;
        this._innerKeeper.dispose();
        this.afterUninit();
    }

    isSameData?(cur: Data, other: Data): boolean;
    dataChanged?(): void;

    addSubView<T extends UISubView>(clazz: gFrameworkDef.Constructor<T>, target: Laya.Sprite): T;
    addSubView(className: string, target: Laya.Sprite): UISubView;
    addSubView(...args: any[]) {
        const viewInfo = UIHelper.ins.getViewInfo(args[0]);
        const viewClazz = viewInfo.viewClazz;
        const uiComp = new viewClazz(args[1]);
        uiComp._internalInit();
        this._subViewList.push(uiComp);
        uiComp.refreshView();
        return uiComp;
    }

    /** 内部用于afterInit完成后执行，也可用于在适当的时候主动调用执行刷新ui的逻辑 */
    refreshView() { }

    onClick(target: Laya.Node, handler: () => void, caller?: any) {
        target.on(Laya.Event.CLICK, caller ?? this, handler);
    }

    setVisible(flag: boolean) {
        if (!this.isValid)
            return;
        this._sprite.visible = flag;
        this.onVisibleChange(flag);
    }

    /** 留坑，用来适配本地资源和远程资源的加载 */
    showIconWith(image: Laya.Image, url: string) {
        image.skin = url;
    }

    protected afterInit() { }

    protected beforeUninit() { }

    protected afterUninit() { }

    protected onVisibleChange(flag: boolean) {}

    protected onDataChange() {
        this.dataChanged?.();
    }

    protected _uiTree: IUITreeNode;
    protected parseUI() {
        if (!this._uiTree) {
            this._uiTree = UIParser.ins.parseUI(this._sprite);
        }
        return this._uiTree;
    }

    protected findChildRecursive(childName: string) {
        childName = childName.toLowerCase();
        const tree = this.parseUI();
        const treeNode = tree.search(childName);
        return treeNode?.sprite ?? void 0;
    }

    protected findChildByPath(path: string) {
        path = path.toLowerCase();
        const tree = this.parseUI();
        const treeNode = tree.searchWithPath(path);
        return treeNode?.sprite ?? void 0;
    }
}

export class UIPanel<Data = any> extends UIView<Data> {
    private _ctrl: BaseViewCtrl;

    onOpen?(...args: any[]): void;
    onReopen?(...args: Parameters<this['onOpen']>): void;
    onClose?(): void;

    get ctrl() { return this._ctrl as ViewCtrl<typeof this>; }

    closeSelf() {
        this._ctrl._close();
    }

    /**
     * @deprecated internal
     */
    _setCtrl(ctrl: BaseViewCtrl) {
        this._ctrl = ctrl;
    }
}

export class UISubView<Data = any> extends UIView<Data> { }
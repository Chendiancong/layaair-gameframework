import { misc, ResMgr } from "../..";
import { layaExtends } from "../../misc";
import { ViewRegInfo } from "./UIHelper";
import { UIPanel } from "./UIView";
import { ViewMgr } from './ViewMgr';

const enum CtrlState {
    Initial,
    Loading,
    Loaded,
    LoadFail,
    Opening,
    Opened,
    Closing,
    Closed
}

export class BaseViewCtrl {
    viewMgr: ViewMgr;
    viewContainer?: Laya.UIComponent;
    viewInfo: ViewRegInfo;
    openArgs?: any[];
    view?: UIPanel;

    protected _ctrlState = CtrlState.Initial;
    protected _loadDefer: misc.PromiseDeferer<UIPanel>;
    protected _openDefer: misc.PromiseDeferer<UIPanel>;

    get loaded() { return this._loadDefer.promise; }
    get opened() { return this._openDefer.promise; }
    get isValid() { return this._ctrlState !== CtrlState.Closed; }

    constructor(viewMgr: ViewMgr, viewInfo: ViewRegInfo) {
        this.viewInfo = viewInfo;
        misc.logger.assert(!!viewInfo.viewName);
        this.viewMgr = viewMgr;
        const container = this.viewContainer = new Laya.UIComponent();
        container.name = viewInfo.viewName;

        const layer = viewInfo.layer ?? viewMgr.layerMgr.defaultLayer;
        const layerNode = viewMgr.layerMgr.getLayer(layer);
        misc.logger.assert(!!layerNode);
        layaExtends.fullsize(container);
        container.mouseThrough = true;
        layerNode.addChild(this.viewContainer);

        misc.logger.assert(!!viewInfo.viewUrl);
        this._loadDefer = new misc.PromiseDeferer();
        this._openDefer = new misc.PromiseDeferer();
    }

    /**
     * @deprecated internal
     */
    _open(...args: any[]) {
        const state = this._ctrlState;
        if (state === CtrlState.Initial) {
            this.openArgs = args;
            this._loadView();
        }
        else if (state === CtrlState.Opened)
            this.view?.onReopen && this.view.onReopen(...args);
        return this.opened;
    }

    /**
     * @deprecated internal
     */
    _openWithPrefab(prefab: Laya.Prefab, ...args: any[]) {
        const state = this._ctrlState;
        if (state === CtrlState.Initial) {
            this.openArgs = args;
        } else if (state === CtrlState.Opened)
            this.view?.onReopen && this.view.onReopen(...args);
        return this.opened;
    }

    /**
     * @deprecated internal
     */
    _close() {
        this._closeView();
    }

    private async _loadView() {
        if (this._ctrlState !== CtrlState.Initial)
            return;
        this._ctrlState = CtrlState.Loading;
        let resInfo: gFrameworkDef.IGenericResInfo<Laya.Prefab>;
        try {
            resInfo = await ResMgr.ins.load<Laya.Prefab>(this.viewInfo.viewUrl);
            misc.logger.assert(layaExtends.isValid(resInfo.res));
        } catch (err) {
            this._ctrlState = CtrlState.LoadFail;
            throw err;
        }

        if (this._ctrlState as number === CtrlState.Closed) {
            resInfo.decRef();
            return;
        }

        this._onViewLoaded(resInfo);
    }

    private _onViewLoaded(resInfo: gFrameworkDef.IGenericResInfo<Laya.Prefab>) {
        this._ctrlState = CtrlState.Loaded;
        const sprite = ResMgr.ins.instantiate<Laya.Sprite>(resInfo);
        const container = this.viewContainer;
        container.addChild(sprite);
        if (!this.view)
            this.view = Reflect.construct(this.viewInfo.viewClazz, [sprite]) as UIPanel;
        this._loadDefer.resolve(this.view);
        this._openView();
    }

    private _openView() {
        const state = this._ctrlState;
        if (state === CtrlState.Opening || (state !== CtrlState.Loaded && state !== CtrlState.Opened))
            return;
        this._ctrlState = CtrlState.Opening;
        if (this.view as UIPanel)
            this.view._setCtrl(this);
        this.view._internalInit();
        this.view.onOpen?.(...this.openArgs);
        this.view.refreshView();
        this._ctrlState = CtrlState.Opened;
        this._openDefer.resolve(this.view);
    }

    private _closeView() {
        const state = this._ctrlState;
        if (state === CtrlState.Closing || state === CtrlState.Closed)
            return;
        this._ctrlState = CtrlState.Closing;
        if (state === CtrlState.Loading)
            this._ctrlState = CtrlState.Closed;
        else {
            this._ctrlState = CtrlState.Closed;
            this.view?._internalUninit();
            this.view?.onClose?.();
            if (layaExtends.isValid(this.viewContainer))
                this.viewContainer.destroy();
        }
    }
}

export class ViewCtrl<ViewClass extends UIPanel> extends BaseViewCtrl {
    declare view?: ViewClass;

    get loaded() { return this._loadDefer.promise as Promise<ViewClass>; }
    get opened() { return this._openDefer.promise as Promise<ViewClass>; }
}
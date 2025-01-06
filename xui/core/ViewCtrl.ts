import { misc, resMgr } from "../..";
import { layaExtends } from "../../misc";
import { ViewRegInfo } from "./UIHelper";
import { UIView } from "./UIScript";
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
    openArg?: any;
    view?: UIView;

    protected _ctrlState = CtrlState.Initial;
    protected _loadDefer: misc.PromiseDeferer<UIView>;
    protected _openDefer: misc.PromiseDeferer<UIView>;

    get loaded() { return this._loadDefer.promise; }
    get opened() { return this._openDefer.promise; }

    constructor(viewMgr: ViewMgr, viewInfo: ViewRegInfo) {
        this.viewInfo = viewInfo;
        misc.logger.assert(!!viewInfo.viewName);
        this.viewMgr = viewMgr;
        const container = this.viewContainer = new Laya.UIComponent();
        container.name = viewInfo.viewName;
        container.width = container.height = 1;

        const layer = viewInfo.layer ?? viewMgr.layerMgr.defaultLayer;
        const layerNode = viewMgr.layerMgr.getLayer(layer);
        misc.logger.assert(!!layerNode);
        layerNode.addChild(this.viewContainer);

        misc.logger.assert(!!viewInfo.viewUrl);
        this._loadDefer = new misc.PromiseDeferer();
        this._openDefer = new misc.PromiseDeferer();

        this._loadView();
    }

    private async _loadView() {
        if (this._ctrlState !== CtrlState.Initial)
            return;
        this._ctrlState = CtrlState.Loading;
        let prefab: Laya.Prefab;
        try {
            prefab = await resMgr.load<Laya.Prefab>(this.viewInfo.viewUrl);
            misc.logger.assert(layaExtends.isValid(prefab));
        } catch (err) {
            this._ctrlState = CtrlState.LoadFail;
            throw err;
        }

        if (this._ctrlState as number === CtrlState.Closed) {
            prefab._removeReference();
            return;
        }

        this._ctrlState = CtrlState.Loaded;
        const node = resMgr.instantiate(prefab) as Laya.Sprite;
        const container = this.viewContainer;
        container.addChild(node);
        container.width = node.width;
        container.height = node.height;
        node.pos(0, 0, true);
        container.centerX = container.centerY = 0;

        if (!this.view)
            this.view = Reflect.construct(this.viewInfo.viewClazz, [node]) as UIView;
        this._loadDefer.resolve(this.view);
        this._openView();
    }

    private _openView() {
        const state = this._ctrlState;
        if (state === CtrlState.Opening || (state !== CtrlState.Loaded && state !== CtrlState.Opened))
            return;
        this._ctrlState = CtrlState.Opening;
        if (this.view?.onOpen)
            this.view.onOpen(this.openArg);
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
            if (this.view?.onClose)
                this.view.onClose();
            this._ctrlState = CtrlState.Closed;
        }
    }
}

export class ViewCtrl<ViewClass extends UIView> extends BaseViewCtrl {
    declare view?: ViewClass;

    get loaded() { return this._loadDefer.promise as Promise<ViewClass>; }
    get opened() { return this._openDefer.promise as Promise<ViewClass>; }
}
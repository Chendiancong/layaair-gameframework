import { BaseViewLayerMgr } from "./ViewLayerMgr";

export class ViewMgr {
    private _rootNode: Laya.Sprite;
    private _layerMgr: BaseViewLayerMgr;

    get rootNode() { return this._rootNode; }
    get layerMgr() { return this._layerMgr; }

    constructor(rootNode: Laya.Sprite, layerMgr: BaseViewLayerMgr) {
        this._rootNode = rootNode;
        this._layerMgr = layerMgr;
        layerMgr.setup(this);
    }
}
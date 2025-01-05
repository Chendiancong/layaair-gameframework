import { ViewLayerMgr } from "./ViewLayerMgr";

export class ViewMgr<LayerEnum extends number = number> {
    private _rootNode: Laya.Sprite;
    private _layerMgr: ViewLayerMgr<LayerEnum>;

    get rootNode() { return this._rootNode; }
    get layerMgr() { return this._layerMgr; }

    constructor(rootNode: Laya.Sprite, layerMgr: ViewLayerMgr<LayerEnum>) {
        this._rootNode = rootNode;
        this._layerMgr = layerMgr;
        layerMgr.setup(this);
    }
}
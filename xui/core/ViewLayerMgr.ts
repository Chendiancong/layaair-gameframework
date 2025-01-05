import { ViewMgr } from "./ViewMgr";

export interface IViewLayerConfig<LayerEnum> {
    allLayers(): Generator<LayerEnum>;
    layerToName(layer: LayerEnum): string|undefined;
    nameToLayer(name: string): LayerEnum|undefined;
}

export class ViewLayerMgr<LayerEnum extends number> {
    private _config: IViewLayerConfig<LayerEnum>;
    private _layerDic: Record<LayerEnum, Laya.Sprite>;

    constructor(config: IViewLayerConfig<LayerEnum>) {
        this._config = config;
    }

    /**
     * @deprecated internal
     */
    setup(viewMgr: ViewMgr) {
        const rootNode = viewMgr.rootNode;
        const config = this._config;
        for (const layerType of config.allLayers()) {
            const layerNode = new Laya.Sprite();
            layerNode.name = config.layerToName(layerType) ?? `Layer_${layerType}`;
            rootNode.addChild(layerNode);
        }
    }

    getLayer(layerType: LayerEnum) {
        return this._layerDic[layerType];
    }
}
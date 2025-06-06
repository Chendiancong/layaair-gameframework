import { layaExtends } from "../../misc";
import { ViewMgr } from "./ViewMgr";

export interface IViewLayerConfig<LayerEnum extends string|number = number|string> {
    readonly defaultLayer: LayerEnum;
    allLayers(): Generator<LayerEnum>;
    layerToName(layer: LayerEnum): string|undefined;
    nameToLayer(name: string): LayerEnum|undefined;
}

export class BaseViewLayerMgr {
    private _config: IViewLayerConfig;
    private _layerDic: Record<string|number, Laya.Sprite>;

    get defaultLayer() { return this._config.defaultLayer; }

    constructor(config: IViewLayerConfig) {
        this._config = config;
    }

    /**
     * @deprecated internal
     */
    setup(viewMgr: ViewMgr) {
        const rootNode = viewMgr.rootNode;
        const config = this._config;
        this._layerDic = {};
        for (const layerType of config.allLayers()) {
            const layerNode = new Laya.UIComponent();
            layerNode.name = config.layerToName(layerType) ?? `Layer_${layerType}`;
            this._layerDic[layerType] = layerNode;
            layaExtends.fullsize(layerNode);
            rootNode.addChild(layerNode);

            layerNode.mouseThrough = true;
        }
    }

    getLayer(layerType: string|number) {
        return this._layerDic[layerType];
    }

    exactify<LayerEnum extends number|string>() {
        return this as ViewLayerMgr<LayerEnum>;
    }
}

export class ViewLayerMgr<LayerEnum extends string|number> extends BaseViewLayerMgr {
    constructor(config: IViewLayerConfig<LayerEnum>) {
        super(config);
    }

    getLayer(layerType: LayerEnum) {
        return super.getLayer(layerType);
    }
}
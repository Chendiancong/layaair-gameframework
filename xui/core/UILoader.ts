import { delegatify, IDelegate, layaExtends } from "../../misc";
import { UISubView } from "./UIView";

export type LoadedHandler<Content> = (loader: UILoader, content: Content) => void;

/**
 * ui元件加载器，可用于延迟加载和初始化ui元素
 */
export class UILoader<Content extends Laya.Sprite = Laya.Sprite, Data = any> extends UISubView<Data> {
    @delegatify
    private _onLoaded: IDelegate<LoadedHandler<Content>>;
    private _content: Content;

    get content() { return this._content; }
    get isLoaded() { return layaExtends.isValid(this._content); }

    constructor(root: Laya.Sprite, resUrl: string) {
        super(root);
        this._init(resUrl);
    }

    onLoaded(handler: LoadedHandler<Content>) {
        if (!this.isLoaded) {
            this._onLoaded.addOnce(handler);
            return;
        }
        handler(this, this._content);
    }

    protected onDataChange(): void {
        if (!this.isLoaded)
            return;
        this.dataChanged?.();
    }

    private async _init(resUrl: string) {

    }
}
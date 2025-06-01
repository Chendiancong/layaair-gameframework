import { delegatify, IDelegate } from "../misc";
import { ResCache } from "./ResCache";

export abstract class ResInfo implements gFrameworkDef.IResInfo {
    protected _innerRes: any;
    protected _refCount: number = 0;
    resUrl: string;
    @delegatify
    postDestroy: IDelegate<(resInfo: gFrameworkDef.IResInfo) => void>;

    get refCount() { return this._refCount; }
    abstract get isValid(): boolean;
    abstract addRef(count?: number): void;
    abstract decRef(count?: number): void;

    static createInfo<T>(url: string, res: T) {
        let info: ResInfo;
        if  (res instanceof Laya.Resource)
            info = new LayaResInfo(url, res);
        else
            info = new CustomResInfo(url, res);
        info.initial();
        return info;
    }

    protected constructor(url: string, res: any) {
        this.resUrl = url;
        this._innerRes = res;
        this._refCount = 0;
        ResCache.ins.addRes(this);
    }

    protected initial() { }

    protected onDestroy() {
        ResCache.ins.removeRes(this);
        this.postDestroy.invoke(this);
    }

    getRes<T>(): T {
        return this._innerRes as T;
    }
}

export class LayaResInfo<T extends Laya.Resource = Laya.Resource> extends ResInfo implements gFrameworkDef.IGenericResInfo<T> {
    declare protected _innerRes: T;

    get isValid() {
        return !!this._innerRes && !this._innerRes.destroyed;
    }
    get res() {
        return this._innerRes;
    }

    addRef(count: number = 1): void {
        if (this._refCount === 0)
            // 只记录一次引用
            this._innerRes?._addReference();
        this._refCount += count;
    }

    decRef(count: number = 1): void {
        this._refCount = Math.max(0, this._refCount - count);
        if (this._refCount <= 0) {
            this._innerRes._removeReference();
            if (this._innerRes.referenceCount <= 0) {
                Laya.loader.clearRes(this.resUrl);
            }
            this._innerRes = void 0;
            this.onDestroy();
        }
    }
}

export class CustomResInfo extends ResInfo {

    get isValid() { return !!this._innerRes; }

    addRef(count: number = 1): void {
        this._refCount += count;
    }

    decRef(count: number = 1): void {
        this._refCount = Math.max(0, this._refCount - count);
        if (this._refCount <= 0) {
            this._innerRes = void 0;
            this.onDestroy();
        }
    }
}
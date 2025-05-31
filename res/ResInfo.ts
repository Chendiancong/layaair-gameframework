import { misc } from "..";
import { delegatify, IDelegate } from "../misc";

export abstract class ResInfo implements gFrameworkDef.IResInfo {
    protected _innerRes: any;
    resUrl: string;
    @delegatify
    postDestroy: IDelegate<(resInfo: gFrameworkDef.IResInfo) => void>;

    abstract get refCount(): number;
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
    }

    protected initial() { }

    protected onDestroy() {
        misc.logger.log(`release res: ${this.resUrl}`);
        this.postDestroy.invoke(this);
    }

    getRes<T>(): T {
        return this._innerRes as T;
    }
}

export class LayaResInfo<T extends Laya.Resource = Laya.Resource> extends ResInfo implements gFrameworkDef.IGenericResInfo<T> {
    declare protected _innerRes: T;

    get refCount() {
        return this._innerRes?.destroyed ?
            0 : (this._innerRes?.referenceCount ?? 0);
    }
    get isValid() {
        return !!this._innerRes && !this._innerRes.destroyed;
    }
    get res() {
        return this._innerRes;
    }

    addRef(count: number = 1): void {
        this._innerRes?._addReference(count);
    }

    decRef(count: number = 1): void {
        this._innerRes?._removeReference(count);
        if (this.refCount <= 0) {
            this._innerRes?.destroy();
            this._innerRes = void 0;
            this.onDestroy();
        }
    }
}

export class CustomResInfo extends ResInfo {
    private _refCount: number;

    get refCount() {
        return this._refCount;
    }
    get isValid() {
        return !!this._innerRes;
    }

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

    protected initial(): void {
        this._refCount = 0;
    }
}
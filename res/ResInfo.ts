export abstract class ResInfo implements gFrameworkDef.IResInfo {
    protected _innerRes: any;

    abstract get refCount(): number;
    abstract addRef(count?: number): void;
    abstract decRef(count?: number): void;

    static createInfo<T>(res: T) {
        let info: ResInfo;
        if  (res instanceof Laya.Resource)
            info = new LayaResInfo(res);
        else
            info = new CustomResInfo(res);
        info.initial();
        return info;
    }

    protected constructor(res: any) {
        this._innerRes = res;
    }

    protected initial() { }

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
    get res() {
        return this._innerRes;
    }

    addRef(count: number = 1): void {
        this._innerRes?._addReference(count);
    }

    decRef(count: number = 1): void {
        this._innerRes?._removeReference(count);
        if (this.refCount <= 0)
            this._innerRes?.destroy();
    }
}

export class CustomResInfo extends ResInfo {
    private _refCount: number;

    get refCount() {
        return this._refCount;
    }

    addRef(count: number = 1): void {
        this._refCount += count;
    }

    decRef(count: number = 1): void {
        this._refCount = Math.max(0, this._refCount - count);
    }

    protected initial(): void {
        this._refCount = 0;
    }
}
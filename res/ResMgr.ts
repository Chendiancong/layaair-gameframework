import { IPoolable, myGlobal, poolMgr, PromiseDeferer, promiseUtil, regPool } from "../misc";
import { ResInfo } from './ResInfo';
import { ResKeeper } from "./ResKeeper";

export class ResMgr {
    private _resInfos = new Map<string, gFrameworkDef.IResInfo>();
    private _pendings = new Map<string, ResRequest>();

    getResInfo(url: string) {
        return this._resInfos.get(url);
    }

    isPending(url: string) {
        return this._pendings.get(url)?.isPending ?? false;
    }

    async load<T extends ResTypes|undefined = undefined>(url: string): Promise<T extends undefined ? gFrameworkDef.IResInfo : gFrameworkDef.IGenericResInfo<T>>;
    async load<K extends ResTypeKey = 'undefined'>(url: string, type: K): Promise<K extends 'any' ? gFrameworkDef.IResInfo : gFrameworkDef.IGenericResInfo<ResTypeMapping[K]>>;
    async load(url: string, type: ResTypeKey = 'undefined'): Promise<gFrameworkDef.IResInfo> {
        let resInfo: gFrameworkDef.IResInfo;
        do {
            resInfo = this._resInfos.get(url);
            if (!!resInfo)
                break;
            const pending = this._confirmRequest(url, type ?? 'undefined');
            resInfo = await pending.loaded;
        } while (false);
        return resInfo as any;
    }

    instantiate<T extends Laya.Node = Laya.Node>(resInfo: gFrameworkDef.IGenericResInfo<Laya.Prefab>, ...args: Parameters<Laya.Prefab['create']>): T {
        return this._internalInstantiate(resInfo, ...args) as T;
    }

    async quickInstantiate<T extends Laya.Node = Laya.Node>(url: string, ...args: Parameters<Laya.Prefab['create']>): Promise<T> {
        const resInfo = await this.load(url);
        return this._internalInstantiate(resInfo, ...args) as T;
    }

    private _internalInstantiate(resInfo: gFrameworkDef.IResInfo, ...args: Parameters<Laya.Prefab['create']>) {
        if (!resInfo.isValid) {
            console.warn('not valid res when instantiate');
            return void 0;
        }
        const res = resInfo.getRes();
        if (!(res instanceof Laya.Prefab)) {
            console.warn('must instantiate using prefab');
            return void 0;
        }
        const node = res.create(...args);
        ResKeeper.register(resInfo, node);
        return node;
    }

    private _confirmRequest(url: string, resType: ResTypeKey) {
        let req = this._pendings.get(url);
        if (!req) {
            this._pendings.set(
                url,
                req = poolMgr
                    .getItem(ResRequest)
                    .setup(url, resType)
            );
            req.start();
            req.loaded.then(resInfo => {
                this._pendings.delete(url);
                poolMgr.pushItem(req);
                this._setResInfo(url, resType, resInfo);
            });
        }
        return req;
    }

    private _setResInfo(url: string, resType: ResTypeKey, resInfo: gFrameworkDef.IResInfo) {
        this._resInfos.set(url, resInfo);
        resInfo.postDestroy.addOnce(this._onResDestroy, this);
    }

    private _onResDestroy(resInfo: gFrameworkDef.IResInfo) {
        this._resInfos.delete(resInfo.resUrl);
    }
}

type ResTypeMapping = {
    'undefined': undefined,
    'TEXT': Laya.TextResource,
    'JSON': Laya.TextResource,
    'XML': Laya.TextResource,
    'BUFFER': Laya.TextResource,
    'IMAGE': Laya.Texture,
    'SOUND': AudioBuffer,
    'VIDEO': Laya.VideoTexture,
    'ATLAS': Laya.AtlasResource,
    'HIERARCHY': Laya.Prefab,
    'FONT': Laya.BitmapFont,
    'MESH': Laya.Mesh,
    'MATERIAL': Laya.Material,
    'TEXTURE2D': Laya.Texture2D,
    'TEXTURECUBE': Laya.TextureCube,
    'SPINE': Laya.SpineTemplet
}

type ResTypeKey = (keyof ResTypeMapping)&(keyof typeof Laya.Loader)|'undefined';
type ResTypes = ResTypeMapping[keyof Omit<ResTypeMapping, 'undefined'>];

@regPool
class ResRequest implements IPoolable {
    private _url: string;
    private _resType: ResTypeKey;
    private _pendingType: 'initial'|'pending'|'ok'|'failed' = 'initial';
    private _defer: PromiseDeferer<gFrameworkDef.IResInfo>;

    get url() { return this._url; }
    get isPending() { return this._pendingType === 'initial'; }
    get loaded() { return this._defer.promise; }

    setup(url: string, typeKey: ResTypeKey = 'undefined') {
        this._url = url;
        this._resType = typeKey;
        this._pendingType = 'initial';
        this._defer = promiseUtil.createDefer();
        return this;
    }

    async start() {
        const pendingType = this._pendingType;
        if (pendingType === 'pending')
            return;
        if (pendingType === 'ok')
            return;
        this._pendingType = 'pending';
        try {
            const url = this._url;
            const res = await Laya.loader.load(
                this._url,
                this._resType === 'undefined' ? void 0 : (Laya.Loader[this._resType] ?? void 0)
            );
            this._defer.resolve(ResInfo.createInfo(url, res));
        } catch (e) {
            this._pendingType = 'failed';
        }
    }

    pool_onCreate() { }

    pool_onReuse() { }

    pool_onRestore() {
        this._url = void 0;
        this._resType = void 0;
        this._pendingType = 'initial';
        this._defer = void 0;
    }

    pool_onDestroy() { }
}

export const resMgr = new ResMgr();
myGlobal.set('resMgr', resMgr);
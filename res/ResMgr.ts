import { IPoolable, poolMgr, PromiseDeferer, promiseUtil, regPool } from "../misc";
import { ResInfo } from './ResInfo';

export class ResMgr {
    private _resInfos = new Map<string, gFrameworkDef.IResInfo>();
    private _pendings = new Map<string, ResRequest>();

    getResInfo(url: string) {
        return this._resInfos.get(url);
    }

    isPending(url: string) {
        return this._pendings.get(url)?.isPending ?? false;
    }

    async load<K extends ResTypes = 'any'>(url: string, type?: K): Promise<K extends 'any' ? gFrameworkDef.IResInfo : gFrameworkDef.IGenericResInfo<ResTypeMapping[K]>>
    {
        let resInfo: gFrameworkDef.IResInfo;
        do {
            resInfo = this._resInfos.get(url);
            if (!!resInfo)
                break;
            const pending = this._confirmRequest(url, type ?? 'any');
            resInfo = await pending.loaded as gFrameworkDef.IResInfo;
        } while (false);

        return resInfo as any;
    }

    private _confirmRequest(url: string, resType: ResTypes) {
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

    private _setResInfo(url: string, resType: ResTypes, resInfo: gFrameworkDef.IResInfo) {
        this._resInfos.set(url, resInfo);
    }
}

type ResTypeMapping = {
    'any': any,
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

type ResTypes = (keyof ResTypeMapping)&(keyof typeof Laya.Loader)|'any';

@regPool
class ResRequest implements IPoolable {
    private _url: string;
    private _resType: ResTypes;
    private _pendingType: 'initial'|'pending'|'ok'|'failed' = 'initial';
    private _defer: PromiseDeferer<gFrameworkDef.IResInfo>;

    get url() { return this._url; }
    get isPending() { return this._pendingType === 'initial'; }
    get loaded() { return this._defer.promise; }

    setup(url: string, resType: ResTypes = 'any') {
        this._url = url;
        this._resType = resType;
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
            const res = await Laya.loader.load(
                this._url,
                this._resType === 'any' ? void 0 : (Laya.Loader[this._resType] ?? void 0)
            );
            this._defer.resolve(ResInfo.createInfo(res));
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
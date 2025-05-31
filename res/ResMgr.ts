import { jsUtil, myGlobal } from "../misc";
import { ResInfo } from "./ResInfo";
import { ResKeeperComponent } from "./ResKeeper";

export class ResMgr {
    @jsUtil.decorators.singleTon
    static ins: ResMgr;

    getRes<T extends ResTypes = void>(url: string): T extends void ? any : T;
    getRes<K extends ResTypeKey = 'unknown'>(url: string, type: K): K extends 'unknown' ? any : ResTypeMapping[K];
    getRes(url: string, type: ResTypeKey = 'unknown'): Promise<any> {
        return Laya.loader.getRes(url, type)
    }

    async load<T extends ResTypes = void>(url: string): Promise<T extends void ? any : T>;
    async load<K extends ResTypeKey = 'unknown'>(url: string, type: K): Promise<K extends 'unknown' ? any : ResTypeMapping[K]>;
    async load(url: string, type: ResTypeKey = 'unknown'): Promise<any> {
        return await Laya.loader.load(url, type === 'unknown' ? void 0 : type);
    }

    async loadMany<K extends ResTypeKey = 'unknown'>(urls: string[], type?: K): Promise<K extends 'unknown' ? any[] : ResTypeMapping[K][]> {
        return await Laya.loader.load(urls, type === 'unknown' ? void 0 : type);
    }

    async loadPackage(packageUrl: string): Promise<void> {
        return await Laya.loader.loadPackage(packageUrl);
    }

    instantiate<T extends Laya.Node = Laya.Node>(res: Laya.Prefab, ...args: Parameters<Laya.Prefab['create']>) {
        const node = res.create(...args);
        ResKeeperComponent.register(ResInfo.createInfo(res.url, res), node);
        return node as T;
    }
}

type ResTypeMapping = {
    'unknown': void,
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

type ResTypeKey = (keyof ResTypeMapping)&(keyof typeof Laya.Loader)|'unknown';
type ResTypes = ResTypeMapping[keyof ResTypeMapping];

myGlobal.set('ResMgr', ResMgr);
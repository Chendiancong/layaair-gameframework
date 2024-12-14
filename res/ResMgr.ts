import { myGlobal } from "../misc";
import { ResInfo } from "./ResInfo";
import { ResKeeper } from "./ResKeeper";

export class ResMgr {
    getRes<T extends ResTypes = void>(url: string): T extends void ? any : T;
    getRes<K extends ResTypeKey = 'UNKNOWN'>(url: string, type: K): K extends 'UNKNOWN' ? any : ResTypeMapping[K];
    getRes(url: string, type: ResTypeKey = 'UNKNOWN'): Promise<any> {
        return Laya.loader.getRes(url, type)
    }

    async load<T extends ResTypes = void>(url: string): Promise<T extends void ? any : T>;
    async load<K extends ResTypeKey = 'UNKNOWN'>(url: string, type: K): Promise<K extends 'UNKNOWN' ? any : ResTypeMapping[K]>;
    async load(url: string, type: ResTypeKey = 'UNKNOWN'): Promise<any> {
        return await Laya.loader.load(url, type === 'UNKNOWN' ? void 0 : type);
    }

    instantiate<T extends Laya.Node = Laya.Node>(res: Laya.Prefab, ...args: Parameters<Laya.Prefab['create']>) {
        const node = res.create(...args);
        ResKeeper.register(ResInfo.createInfo(res.url, res), node);
        return node as T;
    }
}

type ResTypeMapping = {
    'UNKNOWN': void,
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

type ResTypeKey = (keyof ResTypeMapping)&(keyof typeof Laya.Loader)|'UNKNOWN';
type ResTypes = ResTypeMapping[keyof ResTypeMapping];

export const resMgr = new ResMgr();
myGlobal.set('resMgr', resMgr);
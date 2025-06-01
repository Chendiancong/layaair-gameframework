import { misc } from "..";
import { jsUtil, myGlobal } from "../misc";
import { ResCache } from "./ResCache";
import { ResInfo } from "./ResInfo";
import { ResKeeperComponent } from "./ResKeeper";

type FinalResInfo<T> = T extends void ? gFrameworkDef.IResInfo : gFrameworkDef.IGenericResInfo<T>;
type PromiseResInfo<T> = Promise<FinalResInfo<T>>;

export class ResMgr {
    @jsUtil.decorators.singleton
    static ins: ResMgr;

    getRes<T extends ResTypes = void>(url: string): FinalResInfo<T>;
    getRes<K extends ResTypeKey = 'unknown'>(url: string, type: K): FinalResInfo<K extends 'unkknown' ? void : ResTypeMapping[K]>;
    getRes(url: string, _1: ResTypeKey = 'unknown'): FinalResInfo<void> {
        return ResCache.ins.cachedRes.get(url);
    }

    async load<T extends ResTypes = void>(url: string): PromiseResInfo<T>;
    async load<K extends ResTypeKey = 'unknown'>(url: string, type: K): PromiseResInfo<K extends 'unknwon' ? void : ResTypeMapping[K]>;
    async load(url: string, type: ResTypeKey = 'unknown'): PromiseResInfo<void> {
        let resInfo = ResCache.ins.cachedRes.get(url);
        if (resInfo)
            return resInfo;
        const res = await Laya.loader.load(url, type === 'unknown' ? void 0 : type);
        resInfo = ResInfo.createInfo(url, res);
        ResCache.ins.addRes(resInfo);
        return resInfo;
    }

    async loadPackage(packageUrl: string): Promise<void> {
        return await Laya.loader.loadPackage(packageUrl);
    }

    /** @deprecated */
    deprecated_instantiate<T extends Laya.Node = Laya.Node>(res: Laya.Prefab, ...args: Parameters<Laya.Prefab['create']>) {
        const node = res.create(...args);
        ResKeeperComponent.register(ResInfo.createInfo(res.url, res), node);
        return node as T;
    }

    instantiate<T extends Laya.Node = Laya.Node>(resInfo: gFrameworkDef.IGenericResInfo<Laya.Prefab>, ...args: Parameters<Laya.Prefab['create']>) {
        misc.logger.assert(resInfo.isValid);
        const node = resInfo.res.create(...args);
        ResKeeperComponent.register(resInfo, node);
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
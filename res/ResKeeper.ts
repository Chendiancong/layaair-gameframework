import { HashList } from "../misc/HashList";
import { ResCache } from "./ResCache";

export interface IResKeeper extends gFrameworkDef.IDisposable {
    /** 对资源对象增加引用 */
    addResRef(resInfo: gFrameworkDef.IResInfo): void;
    /** 对资源对象减少引用 */
    decResRef(resUrl: string): void;
}

export class ResKeeper implements IResKeeper {
    private _resUrls = new Set<string>();

    addResRef(resInfo: gFrameworkDef.IResInfo) {
        if (this._resUrls.has(resInfo.resUrl))
            return;
        // 只记录一次资源引用
        this._resUrls.add(resInfo.resUrl);
        resInfo.addRef();
    }

    decResRef(resUrl: string) {
        if (!this._resUrls.has(resUrl))
            return;
        this._resUrls.delete(resUrl);
        const resInfo = ResCache.ins.getCachedRes(resUrl);
        resInfo?.decRef();
    }

    getRes<T>(resUrl: string) {
        return ResCache.ins.getCachedRes(resUrl)?.getRes<T>();
    }

    dispose() {
        if (this._resUrls.size) {
            const list = Array.from(this._resUrls);
            this._resUrls.clear();
            for (const url of list) {
                const resInfo = ResCache.ins.getCachedRes(url);
                resInfo?.decRef();
            }
        }
    }
}

@Laya.regClass()
export class ResKeeperComponent extends Laya.Script implements IResKeeper {
    private _resUrls = new Set<string>();

    static register(resInfo: gFrameworkDef.IResInfo, node: Laya.Node, keeper?: ResKeeperComponent) {
        keeper = keeper ?? node.addComponent(ResKeeperComponent);
        keeper.addResRef(resInfo)
    }

    onDestroy(): void {
        this.dispose();
    }

    addResRef(resInfo: gFrameworkDef.IResInfo) {
        if (this._resUrls.has(resInfo.resUrl))
            return;
        this._resUrls.add(resInfo.resUrl);
        resInfo.addRef();
    }

    decResRef(resUrl: string) {
        if (!this._resUrls.has(resUrl))
            return;
        this._resUrls.add(resUrl);
        const resInfo = ResCache.ins.getCachedRes(resUrl);
        resInfo?.decRef();
    }

    dispose() {
        if (this._resUrls.size > 0) {
            const list = Array.from(this._resUrls);
            this._resUrls.clear();
            for (const url of list) {
                const resInfo = ResCache.ins.getCachedRes(url);
                resInfo?.decRef();
            }
        }
    }
}
import { misc, ResInfo } from "..";
import { jsUtil, myGlobal } from "../misc";
import { HashList } from "../misc/HashList";

export class ResCache {
    @jsUtil.decorators.singleton
    static ins: ResCache;

    cachedRes = new HashList<string, gFrameworkDef.IResInfo>();
    toDeleteRes = new HashList<string, gFrameworkDef.IResInfo>();

    constructor() {
        setInterval(this._gc.bind(this), 500);
    }

    addRes(res: gFrameworkDef.IResInfo) {
        if (!this.cachedRes.has(res.resUrl)) {
            this.cachedRes.add(res.resUrl, res);
            misc.logger.log(`Add res cache:${res.resUrl}`);
        }
    }

    removeRes(res: gFrameworkDef.IResInfo) {
        const resInfo = this.cachedRes.get(res.resUrl);
        if (!!resInfo) {
            this.cachedRes.delete(res.resUrl);
            this.toDeleteRes.add(res.resUrl, resInfo);
        }
    }

    getCachedRes(resUrl: string) {
        return this.cachedRes.get(resUrl);
    }

    private _gc() {
        if (this.toDeleteRes.size > 0) {
            const list = this.toDeleteRes.toList();
            this.toDeleteRes.clear();
            for (let i = 0, il = list.length; i < il; ++i) {
                const resInfo: ResInfo = list[i] as any;
                const res = resInfo.getRes();
                if (res instanceof Laya.Resource) {
                    if (res.referenceCount <= 0)
                        Laya.loader.clearRes(resInfo.resUrl);
                }
                misc.logger.log(`Release res cache:${resInfo.resUrl}`);
                resInfo.dispose();
            }
        }
    }
}

myGlobal.set("ResCache", ResCache);
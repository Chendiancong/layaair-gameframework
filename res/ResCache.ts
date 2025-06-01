import { misc } from "..";
import { jsUtil, myGlobal } from "../misc";
import { HashList } from "../misc/HashList";

export class ResCache {
    @jsUtil.decorators.singleton
    static ins: ResCache;

    cachedRes = new HashList<string, gFrameworkDef.IResInfo>();

    addRes(res: gFrameworkDef.IResInfo) {
        if (!this.cachedRes.has(res.resUrl)) {
            this.cachedRes.add(res.resUrl, res);
            misc.logger.log(`Add res cache:${res.resUrl}`);
        }
    }

    removeRes(res: gFrameworkDef.IResInfo) {
        if (this.cachedRes.has(res.resUrl)) {
            this.cachedRes.delete(res.resUrl);
            misc.logger.log(`Release res cache:${res.resUrl}`);
        }
    }
}

myGlobal.set("ResCache", ResCache);
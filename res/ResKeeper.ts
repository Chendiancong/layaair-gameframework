import { HashList } from "../misc/HashList";

export interface IResKeeper extends gFrameworkDef.IDisposable {
    /** 对资源对象增加引用 */
    addResRef(resInfo: gFrameworkDef.IResInfo): void;
    /** 对资源对象减少引用 */
    decResRef(resUrl: string): void;
}

export class ResKeeper implements IResKeeper {
    private _resInfos: HashList<string, gFrameworkDef.IResInfo>;

    constructor() {
        this._resInfos = new HashList();
    }

    addResRef(resInfo: gFrameworkDef.IResInfo) {
        const info = this._resInfos.get(resInfo.resUrl);
        if (!!info)
            return;
        // 只记录一次资源引用
        this._resInfos.add(resInfo.resUrl, resInfo);
        resInfo.addRef();
    }

    decResRef(resUrl: string) {
        const info = this._resInfos.get(resUrl);
        if (!info)
            return;
        info.decRef();
        if (!info.isValid)
            this._resInfos.delete(resUrl);
    }

    dispose() {
        if (this._resInfos.size) {
            const list = this._resInfos.toList();
            this._resInfos.clear();
            for (const info of list)
                info.decRef();
        }
    }
}

@Laya.regClass()
export class ResKeeperComponent extends Laya.Script implements IResKeeper {
    private _resInfos = new HashList<string, gFrameworkDef.IResInfo>();

    static register(resInfo: gFrameworkDef.IResInfo, node: Laya.Node, keeper?: ResKeeperComponent) {
        keeper = keeper ?? node.addComponent(ResKeeperComponent);
        keeper.addResRef(resInfo)
    }

    onDestroy(): void {
        this.dispose();
    }

    addResRef(resInfo: gFrameworkDef.IResInfo) {
        const info = this._resInfos.get(resInfo.resUrl);
        if (!!info)
            return;
        this._resInfos.add(resInfo.resUrl, resInfo);
        resInfo.addRef();
    }

    decResRef(resUrl: string) {
        const info = this._resInfos.get(resUrl);
        if (!info)
            return;
        info.decRef();
        if (!info.isValid)
            this._resInfos.delete(info.resUrl);
    }

    dispose() {
        if (this._resInfos.size > 0) {
            const list = this._resInfos.toList();
            this._resInfos.clear();
            for (const info of list)
                info.decRef();
        }
    }
}
@Laya.regClass()
export class ResKeeper extends Laya.Script {
    private _resInfo: gFrameworkDef.IResInfo;

    static register(resInfo: gFrameworkDef.IResInfo, node: Laya.Node, keeper?: ResKeeper) {
        keeper = keeper ?? node.addComponent(ResKeeper);
        keeper._setResInfo(resInfo);
    }

    onDestroy(): void {
        this._resInfo.decRef();
    }

    private _setResInfo(resInfo: gFrameworkDef.IResInfo) {
        resInfo.addRef();
        this._unlink();
        this._resInfo = resInfo;
    }

    private _unlink() {
        if (!!this._resInfo) {
            this._resInfo.decRef();
            this._resInfo = void 0;
        }
    }
}
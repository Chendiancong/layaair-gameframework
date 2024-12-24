export class ViewMgr {
    private _rootNode: Laya.Sprite;

    get rootNode() { return this._rootNode; }

    constructor(rootNode: Laya.Sprite) {
        this._rootNode = rootNode;
    }
}
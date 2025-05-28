import { misc } from "../..";
import { layaExtends } from "../../misc";
import { uiHelper } from "./UIHelper";
import { BaseViewCtrl, ViewCtrl } from "./ViewCtrl";

export abstract class UIView<Data = any> {
    protected _sprite: Laya.Sprite;
    protected _data: Data;

    get data() { return this._data; }
    set data(val: Data) {
        if (this.isSameData && this.isSameData(this._data, val))
            return;
        this._data = val;
        if (this.dataChanged)
            this.dataChanged();
        this._sprite.event('DATA_CHANGED', this._data);
    }

    get asSprite() { return this._sprite; }
    get asNode() { return this._sprite as Laya.Node; }

    constructor(sprite: Laya.Sprite) {
        this._sprite = sprite;
    }

    /**
     * @deprecated internal
     */
    _internalSetup() {
        const props = uiHelper.getUIProps(this);
        for (const pName in props) {
            const prop = props[pName];
            let child: Laya.Sprite = null;
            if (prop.path)
                child = this.findChildByPath(prop.path, this._sprite);
            else if (prop.recursive)
                child = this.findChildRecursive(pName, this._sprite);
            else
                child = this.findChild(pName, this._sprite);
            misc.logger.assert((!!child || prop.optional));
            (this as any)[pName] = child;
        }
    }

    /**
     * @deprecated internal
     */
    _destroySelf(...args: Parameters<Laya.Node["destroy"]>) {
        if (!layaExtends.isValid(this._sprite))
            return;
        this._sprite.destroy(...args);
    }

    isSameData?(cur: Data, other: Data): boolean;
    dataChanged?(): void;

    onClick(target: Laya.Node, handler: () => void, caller?: any) {
        target.on(Laya.Event.CLICK, caller ?? this, handler);
    }

    protected findChild(childName: string, sprite: Laya.Sprite) {
        return this._getChildByKey(childName.toLowerCase());
    }

    protected findChildRecursive(childName: string, sprite: Laya.Sprite) {
        childName = childName.toLowerCase();
        const dic = this._getChildDic();
        let child: Laya.Sprite;
        for (const k in dic) {
            const idx = k.search(childName);
            if (idx >= 0) {
                if (idx === 0 || idx + childName.length === k.length || k[idx + childName.length] === '.')
                    child = dic[k];
            }
        }
        return child;
    }

    protected findChildByPath(path: string, sprite: Laya.Sprite) {
        const childKey = path.split(/[\/\.\\]/).map(v => v.toLowerCase()).join('.');
        return this._getChildByKey(childKey);
    }

    private _getChildByKey(childKey: string) {
        return this._getChildDic()[childKey];
    }

    private _uiChildDic: Record<string, Laya.Sprite>;
    private _uiTree: UITreeNode
    private _getChildDic() {
        if (!this._uiChildDic) {
            this._uiChildDic = {};
            this._uiTree = new UITreeNode("__root__");
            this._parseUI(this._sprite);
            this._parseUI2(this._sprite);
        }
        return this._uiChildDic;
    }

    private _parseUI2(cur: Laya.Sprite, prevKey: string = "") {
        const dic = this._uiChildDic;
        for (let i = 0, il = cur.numChildren; i < il; ++i) {
            const child = cur.getChildAt(i);
            if (child instanceof Laya.Sprite) {
                let name = child.name.toLowerCase();
                if (!name)
                    name = "defaultsprite";
                const key = prevKey + name;
                dic[key] = child;
                this._parseUI2(child, `${key}.`);
            }
        }
    }

    private _parseUI(cur: Laya.Sprite, upper?: UITreeNode) {
        upper = upper ?? this._uiTree;
        for (let i = 0, il = cur.numChildren; i < il; ++i) {
            const child = cur.getChildAt(i);
            if (child instanceof Laya.Sprite) {
                let name = child.name;
                if (!name)
                    continue;
                const node = new UITreeNode(name);
                node.sprite = child;
                this._parseUI(child, node);
            }
        }
    }
}

class UITreeNode {
    key: string;
    children: Record<string, UITreeNode>;
    sprite: Laya.Sprite;

    constructor(key: string) {
        this.key = key;
        this.children = {};
    }

    search(key: string) {
        if (this.key === key)
            return this;
        if (!this.children)
            return void 0;
        let target: UITreeNode;
        for (const childKey in this.children) {
            target = this.children[childKey].search(key);
            if (target != void 0)
                break;
        }
        return target;
    }

    searchWithPath(path: string) {
        const sections = path.split(/[\/\.\\]/);
        return this.internalSearchWithPath(sections);
    }

    private internalSearchWithPath(sections: string[]) {
        let target: UITreeNode;
        while (sections.length) {
            target = this.search(sections.shift());
            if (target == void 0)
                break;
        }
        if (sections.length === 0)
            return target;
        else
            return void 0;
    }
}

export class UIPanel<Data = any> extends UIView<Data> {
    private _ctrl: BaseViewCtrl;

    onOpen?(...args: any[]): void;
    onReopen?(...args: Parameters<this['onOpen']>): void;
    onClose?(): void;

    get ctrl() { return this._ctrl as ViewCtrl<typeof this>; }

    closeSelf() {
        this._ctrl._close();
    }

    /**
     * @deprecated internal
     */
    _setCtrl(ctrl: BaseViewCtrl) {
        this._ctrl = ctrl;
    }
}

export class UIComp extends UIView { }
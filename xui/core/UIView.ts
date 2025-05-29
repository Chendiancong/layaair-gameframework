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
                child = this.findChildByPath(prop.path);
            else
                child = this.findChildRecursive(pName);
            misc.logger.assert((!!child || prop.optional));

            if (prop.type) {
                const uicomp = new UIComp(child);
                uicomp._internalSetup();
                (this as any)[pName] = uicomp;
            } else {
                (this as any)[pName] = child;
            }

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

    protected findChildRecursive(childName: string) {
        childName = childName.toLowerCase();
        const tree = this._getUITree();
        const treeNode = tree.search(childName);
        return treeNode?.sprite ?? void 0;
    }

    protected findChildByPath(path: string) {
        path = path.toLowerCase();
        const tree = this._getUITree();
        const treeNode = tree.searchWithPath(path);
        return treeNode?.sprite ?? void 0;
    }

    private _uiTree: UITreeNode
    private _getUITree() {
        if (!this._uiTree) {
            this._uiTree = new UITreeNode("__root__");
            this._parseUI(this._sprite, this._uiTree);
        }
        return this._uiTree;
    }

    private _parseUI(cur: Laya.Sprite, upper?: UITreeNode) {
        upper = upper ?? this._uiTree;
        for (let i = 0, il = cur.numChildren; i < il; ++i) {
            const child = cur.getChildAt(i);
            if (child instanceof Laya.Sprite) {
                let name = child.name;
                if (!name)
                    continue;
                const node = new UITreeNode(name.toLowerCase());
                node.sprite = child;
                upper.addChild(node);
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

    addChild(node: UITreeNode) {
        this.children[node.key] = node;
    }

    search(key: string) {
        if (this.key === key)
            return this;
        if (!this.children)
            return void 0;
        let target: UITreeNode;
        outer: do {
            const child = this.children[key];
            if (child != void 0) {
                target = child;
                break;
            }
            for (const childKey in this.children) {
                target = this.children[childKey].search(key);
                if (target != void 0)
                    break outer;
            }
        } while (false);

        return target;
    }

    searchWithPath(path: string) {
        const sections = path.split(/[\/\.\\]/);
        return this.internalSearchWithPath(sections);
    }

    private internalSearchWithPath(sections: string[]) {
        let cur = this as UITreeNode;
        for (let i = 0, il = sections.length; i < il; ++i) {
            const section = sections[i];
            cur = cur.search(section);
            if (!cur)
                break;
        }
        return cur;
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

export class UIComp<Data = any> extends UIView<Data> { }
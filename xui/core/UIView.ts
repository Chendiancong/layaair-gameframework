import { layaExtends } from "../../misc";
import { uiHelper } from "./UIHelper";

export abstract class UIView<Data = any> {
    protected _node: Laya.Node;
    protected _data: Data;

    get data() { return this._data; }
    set data(val: Data) {
        if (this.isSameData && this.isSameData(this._data, val))
            return;
        this._data = val;
        if (this.dataChanged)
            this.dataChanged();
        this._node.event('DATA_CHANGED', this._data);
    }

    get asNode() { return this._node; }
    get asSprite() { return this._node as Laya.Sprite; }

    constructor(node: Laya.Node) {
        this._node = node;
    }

    /**
     * @deprecated internal
     */
    _internalSetup() {
        const props = uiHelper.getUIProps(this);
        for (const pName in props) {
            const prop = props[pName];
            let child: Laya.Node;
            if (prop.path)
                child = this._findChildByPath(prop.path, this._node);
            else if (prop.recursive)
                child = this._findChildRecursive(pName, this._node);
            else
                child = this._findChild(pName, this._node);
        }
    }

    /**
     * @deprecated internal
     */
    _destroySelf(...args: Parameters<Laya.Node["destroy"]>) {
        this._node.destroy(...args);
    }

    isSameData?(cur: Data, other: Data): boolean;
    dataChanged?(): void;

    onClick(target: Laya.Node, handler: () => void, caller?: any) {
        target.on(Laya.Event.CLICK, caller ?? this, handler);
    }

    protected _findChild(childName: string, node: Laya.Node) {
        return node.getChildByName(childName);
    }

    protected _findChildRecursive(childName: string, node: Laya.Node) {
        let child = node.getChildByName(childName) ?? void 0;
        do {
            if (layaExtends.isValid(child))
                break;
            for (let i = 0, len = node.numChildren; i < len; ++i) {
                child = this._findChildRecursive(childName, node.getChildAt(i));
                if (layaExtends.isValid(child))
                    break;
            }
        } while (false);
        return child;
    }

    protected _findChildByPath(path: string, node: Laya.Node) {
        const pathSections = path.split(/[\/\.\\]/).filter(v => !!v);
        let cur = node;
        let target: Laya.Node;
        for (let i = 0, len = pathSections.length; i < len; ++i) {
            cur = cur.getChildByName(pathSections[i]);
            if (i === len - 1)
                target = cur;
        }
        return target;
    }
}

export class UIPanel extends UIView {
    onOpen?(...args: any[]): void;
    onReopen?(...args: Parameters<this['onOpen']>): void;
    onClose?(): void;
}

export class UIComp extends UIView { }
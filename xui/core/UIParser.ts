import { arrayUtil, jsUtil } from "../../misc";
import { HashList } from "../../misc/HashList";

export class UIParser {
    @jsUtil.decorators.singleton
    public static ins: UIParser;

    parseUI(cur: Laya.Sprite, upper?: _UITreeNode) {
        upper = upper ?? new _UITreeNode("__root__");
        for (let i = 0, il = cur.numChildren; i < il; ++i) {
            const child = cur.getChildAt(i);
            if (child instanceof Laya.Sprite) {
                const name = child.name;
                if (!name)
                    continue;
                const node = new _UITreeNode(name.toLowerCase());
                node.sprite = child;
                upper.addChild(node);
                this.parseUI(child, node);
            }
        }

        return upper as IUITreeNode;
    }

    parseFUI() {

    }
}

export interface IUITreeNode {
    readonly key: string;
    readonly children: HashList<string, IUITreeNode>;
    readonly sprite?: Laya.Sprite;

    search(key: string): IUITreeNode;
    searchWithPath(path: string): IUITreeNode;
}

class _UITreeNode implements IUITreeNode {
    key: string;
    children: HashList<string, _UITreeNode>;
    sprite?: Laya.Sprite;

    constructor(key: string) {
        this.key = key;
        this.children = new HashList();
    }

    addChild(node: _UITreeNode) {
        this.children.add(node.key, node);
    }

    forEachChildren(handler: (treeNode: _UITreeNode) => void) {
        const list: _UITreeNode[] = Array.from(this.children.toList());
        while (list.length) {
            const next = list.shift();
            handler(next);
            arrayUtil.append(list, next.children.toList());
        }
    }

    search(key: string) {
        if (this.key === key)
            return this;
        if (!this.children)
            return void 0;
        let target: _UITreeNode;
        outer: do {
            const child = this.children.get(key);
            if (!child != void 0) {
                target = child;
                break;
            }
            for (const nextChild of this.children) {
                target = nextChild.search(key);
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
        let cur = this as _UITreeNode;
        for (let i = 0, il = sections.length; i < il; ++i) {
            const section = sections[i];
            cur = cur.children.get(section);
            if (!cur)
                break;
        }
        return cur;
    }
}
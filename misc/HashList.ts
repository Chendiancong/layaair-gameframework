import { ILinkedListNode } from "./LinkedList";
import { IPoolable, poolMgr, regPool } from "./ObjectPool";

export class HashList<Key, Value> {
    private _head: HashListNode<Value>;
    private _tail: HashListNode<Value>;
    private _keyToNode: Map<Key, HashListNode<Value>>;

    constructor() {
        this._head = new HashListNode<Value>();
        this._tail = new HashListNode<Value>();
        this._keyToNode = new Map<Key, HashListNode<Value>>();

        this._head.next = this._tail;
        this._tail.prev = this._head;
    }

    has(key: Key) {
        return !!this._keyToNode.get(key);
    }

    add(key: Key, value: Value) {
        let cur = this._keyToNode.get(key);
        if (cur != void 0) {
            cur.value = value;
            return;
        }
        this._internalAdd(key, value);
    }

    delete(key: Key): boolean {
        return this._internalDelete(key);
    }

    get(key: Key): Value|undefined {
        const cur = this._keyToNode.get(key);
        return cur?.value ?? void 0;
    }

    clear() {
        let cur = this._head.next;
        while (cur !== this._tail) {
            let next = cur.next;
            poolMgr.pushItem(cur);
            cur = next;
        }
    }

    forEach(handler: (value: Value) => void) {
        let cur = this._head.next;
        while (cur !== this._tail) {
            handler(cur.value);
            cur = cur.next;
        }
    }

    *values() {
        let cur = this._head.next;
        while (cur !== this._tail) {
            yield cur.value;
            cur = cur.next;
        }
    }

    private _internalAdd(key: Key, value: Value) {
        const newNode = poolMgr.getItem(HashListNode<Value>);
        newNode.value = value;
        const last = this._tail.prev;
        last.next = newNode;
        newNode.prev = last;
        newNode.next = this._tail;
        this._tail.prev = newNode;
        this._keyToNode.set(key, newNode);
    }

    private _internalDelete(key: Key) {
        const cur = this._keyToNode.get(key);
        if (cur == void 0)
            return false;
        const next = cur.next;
        const prev = cur.prev;
        prev.next = next;
        next.prev = prev;
        poolMgr.pushItem(cur);
        return true;
    }
}

@regPool
export class HashListNode<T> implements ILinkedListNode<T>, IPoolable {
    value: T;
    prev: HashListNode<T>;
    next: HashListNode<T>;

    pool_onCreate() { }

    pool_onReuse() { }

    pool_onRestore() {
        this.value = void 0;
        this.prev = void 0;
        this.next = void 0;
    }

    pool_onDestroy() { }
}
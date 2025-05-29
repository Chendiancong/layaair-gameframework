import { IPoolable, poolMgr, regPool } from "./ObjectPool";

export class LinkedList<T> {
    private _head: LinkedListNode<T>;
    private _tail: LinkedListNode<T>;

    constructor() {
        this._head = poolMgr.getItem(LinkedListNode<T>);
        this._tail = poolMgr.getItem(LinkedListNode<T>);
        this._head.next = this._tail;
        this._tail.prev = this._head;
    }

    push(value: T) {
        const newNode = poolMgr.getItem(LinkedListNode<T>);
        newNode.value = value;
        const last = this._tail.prev;
        last.next = newNode;
        newNode.prev = last;
        newNode.next = this._tail;
        this._tail.prev = newNode;
    }

    unshift(value: T) {
        const newNode = poolMgr.getItem(LinkedListNode<T>);
        newNode.value = value;
        const first = this._head.next;
        this._head.next = newNode;
        newNode.prev = this._head;
        newNode.next = first;
        first.prev = newNode;
    }

    clear() {
        let cur = this._head.next;
        while (cur !== this._tail) {
            let next = cur.next;
            poolMgr.pushItem(cur);
            cur = next;
        }
    }

    forEach(handler: (value: T) => void) {
        for (const value of this.everyValue())
            handler(value);
    }

    forEachNode(handler: (node: ILinkedListNode<T>) => void) {
        for (const node of this.everyNode())
            handler(node);
    }

    *everyNode() {
        let cur = this._head.next;
        while (cur !== this._tail) {
            yield cur as ILinkedListNode<T>;
        }
    }

    *everyValue() {
        let cur = this._head.next;
        while (cur !== this._tail) {
            yield cur.value
        }
    }
}

export interface ILinkedListNode<T> {
    readonly value: T;
    readonly prev: ILinkedListNode<T>;
    readonly next: ILinkedListNode<T>;
}

@regPool
class LinkedListNode<T> implements IPoolable, ILinkedListNode<T> {
    value: T;
    prev: LinkedListNode<T>;
    next: LinkedListNode<T>;

    pool_onCreate() { }

    pool_onReuse() { }

    pool_onRestore() {
        this.clear();
    }

    pool_onDestroy() {
        this.clear();
    }

    private clear() {
        this.value = void 0;
        this.prev = void 0;
        this.next = void 0;
    }
}
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
    }
}

export interface ILinkedListNode<T> {
    readonly value: T;
    readonly prev: ILinkedListNode<T>;
    readonly next: ILinkedListNode<T>;
}

@regPool
export class LinkedListNode<T> implements IPoolable, ILinkedListNode<T> {
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
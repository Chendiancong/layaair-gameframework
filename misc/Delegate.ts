import { jsUtil } from "./JsUtil";
import { IPoolable, poolMgr, regPool } from "./ObjectPool";

export class Delegate<T extends (...args: any[]) => void> implements IDelegate<T> {
    private _handlers: DelegateHandler[] = [];

    add(func: T, caller?: any) {
        this._add(func, caller, false);
    }

    addOnce(func: T, caller?: any) {
        this._add(func, caller, true);
    }

    private _add(func: T, caller: any, isOnce: boolean) {
        let cur = jsUtil.arrayFind(
            this._handlers,
            val => val.isSame(func, caller)
        );
        if (!cur)
            this._handlers.push(cur = poolMgr.getItem(DelegateHandler));
        cur.setup(func, caller, isOnce);
    }

    del(func: T, caller?: any) {
        const cur = jsUtil.arrayFind(
            this._handlers,
            val => val.isSame(func, caller)
        );
        if (!cur)
            return;

        jsUtil.arrayRemove(this._handlers, cur);
        poolMgr.pushItem(cur);
    }

    clear(caller?: any) {
        if (caller != void 0) {
            let i = 0, j = 0;
            const handlers = this._handlers;
            const removed: DelegateHandler[] = [];
            for (; i < handlers.length; ++i) {
                if (handlers[i].isSameCaller(caller)) {
                    removed.push(handlers[i]);
                    continue;
                }
                handlers[j++] = handlers[i];
            }
            if (removed.length) {
                for (const h of removed)
                    poolMgr.pushItem(h);
            }
        } else {
            const handlers = this._handlers.concat();
            this._handlers.length = 0;
            for (const h of handlers)
                poolMgr.pushItem(h);
        }
    }

    invoke(...args: Parameters<T>) {
        for (const h of this._handlers)
            h.invoke(...args);
    }
}

export interface IDelegate<T extends (...args: any[]) => void = (...args: any[]) => void> {
    add(func: T, caller?: any): void;
    addOnce(func: T, caller?: any): void;
    del(func: T, caller?: any): void;
    clear(caller?: any): void;
    invoke(...args: Parameters<T>): void;
}

export function delegatify(clazzOrProto: any, propName: string) {
    const key = `$${propName}`;
    let desc: PropertyDescriptor = {
        get: function (this: any) {
            let val = this[key];
            if (val == void 0) {
                val = this[key] = new Delegate();
            }
            return val;
        }
    }
    return desc as any;
}

@regPool
class DelegateHandler implements gFrameworkDef.IEqualable<DelegateHandler>, IPoolable {
    handler: Function;
    caller: any;
    isOnce: boolean;

    invoke(...args: any[]) {
        this.handler.call(this.caller, ...args);
    }

    isSame(handler: Function, caller: any) {
        return this.handler === handler &&
            this.caller == caller
    }

    isSameCaller(caller: any) {
        return this.caller == caller;
    }

    equals(other: DelegateHandler): boolean {
        return this.isSame(other.handler, other.caller);
    }

    setup(handler: Function, caller: any, isOnce: boolean) {
        this.handler = handler;
        this.caller = caller;
        this.isOnce = isOnce;
        return this;
    }
    
    pool_onCreate() { }

    pool_onReuse() { }

    pool_onRestore() {
        this.handler = void 0;
        this.caller = void 0;
        this.isOnce = false;
    }

    pool_onDestroy() {
        this.pool_onRestore();
    }
}
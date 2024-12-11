import { jsUtil } from "./JsUtil";

export interface IPoolable {
    pool_onCreate(): void;
    pool_onReuse(): void;
    pool_onRestore(): void;
    pool_onDestroy(): void;
}

export class ObjectPool<T extends IPoolable = IPoolable> {
    private _objs: IPoolable[] = [];
    private _clazz: gFrameworkDef.Constructor<T>;

    constructor(clazz: gFrameworkDef.Constructor<T>) {
        this._clazz = clazz;
    }

    getItem() {
        let obj: IPoolable;
        if (this._objs.length) {
            obj = this._objs.pop();
            obj.pool_onReuse();
        } else {
            obj = new this._clazz();
            obj.pool_onCreate();
        }
        (obj as any)[poolMgr.kPoolTagKey] = false;
        return obj;
    }

    pushItem(obj: T) {
        if ((obj as any)[poolMgr.kPoolTagKey] === void 0) {
            return;
        }
        obj.pool_onRestore();
        (obj as any)[poolMgr.kPoolTagKey] = true;
        this._objs.push(obj);
    }

    clear() {
        const objs = this._objs.concat();
        this._objs.length = 0;
        for (const o of objs)
            o.pool_onDestroy();
    }
}

export const poolMgr = new class {
    readonly kClassNameKey = '$poolClassName';
    readonly kPoolTagKey = '$isInPool';
    readonly poolClazzs = jsUtil.createClassRegister<IPoolable>();

    private _pools: Record<string, ObjectPool> = {};

    setClassInfo(className: string, clazz: gFrameworkDef.Constructor<IPoolable>) {
        clazz.prototype[this.kClassNameKey] = className;
        this.poolClazzs.setClass(className, clazz);
    }

    getItem<T extends IPoolable>(clazz: gFrameworkDef.Constructor<T>) {
        const className = clazz.prototype[this.kClassNameKey];
        const info = this.poolClazzs.getClassByName(className);
        if (!info)
            throw new Error();
        return this.getPool(className, info.ctor).getItem() as T;
    }

    pushItem<T extends IPoolable>(item: T) {
        const className = Object.getPrototypeOf(item)[this.kClassNameKey];
        const info = this.poolClazzs.getClassByName(className);
        if (!info)
            return;
        this.getPool(className, info.ctor).pushItem(item);
    }

    getPool<T extends IPoolable>(poolName: string, clazz: gFrameworkDef.Constructor<T>) {
        let p = this._pools[poolName];
        if (!p)
            p = this._pools[poolName] = new ObjectPool(clazz);
        return p as ObjectPool<T>;
    }
}

export function regPool<T extends IPoolable>(clazz: gFrameworkDef.Constructor<T>): void;
export function regPool(className: string): (clazz: gFrameworkDef.Constructor<IPoolable>) => void;
export function regPool(nameOrClazz: string|gFrameworkDef.Constructor<IPoolable>) {
    if (typeof nameOrClazz === 'string')
        return function (clazz: gFrameworkDef.Constructor<IPoolable>) {
            poolMgr.setClassInfo(nameOrClazz, clazz);
        }
    else
        poolMgr.setClassInfo((nameOrClazz as gFrameworkDef.Constructor).name, nameOrClazz);
}
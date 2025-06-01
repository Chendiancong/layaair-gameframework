import { misc } from "..";
import { arrayUtil } from "./ArrayUtil";

class JsUtil {
    readonly mixinTag = '$mixinCls';
    readonly staticMixinTag = '$staticMixinCls';
    readonly classRegger = new ClassRegister();

    arrayContains<T>(array: T[], target: T) {
        for (const val of array) {
            if (this.equals(val, target))
                return true;
        }
        return false;
    }

    arrayFind<T>(array: T[], predicate: (val: T) => boolean) {
        for (const val of array) {
            if (predicate(val))
                return val;
        }
    }

    arrayRemove<T>(array: T[], target: T) {
        return this.arrayFilter(
            array,
            val => !this.equals(val, target)
        );
    }

    arrayRemoveMany<T>(array: T[], predicate: (val: T) => boolean) {
        return this.arrayFilter(
            array,
            val => !predicate(val)
        );
    }

    arrayFilter<T>(array: T[], predicate: (val: T) => boolean) {
        let i = 0, j = 0;
        for (; i < array.length; ++i) {
            if (predicate(array[i]))
                array[j++] = array[i];
        }
        array.length = j;
        return array;
    }

    equals<T>(a: T, b: T) {
        const isSame = !!(a as gFrameworkDef.IEqualable<T>)?.equals ?
            (a as gFrameworkDef.IEqualable<T>).equals(b) :
            a === b;
        return isSame;
    }

    applyMixins<T>(derivedCtor: gFrameworkDef.Constructor<T>, baseCtors: gFrameworkDef.Constructor[]) {
        let mixinCls = derivedCtor.prototype[this.mixinTag] as gFrameworkDef.Constructor[];
        if (!mixinCls)
            mixinCls = derivedCtor.prototype[this.mixinTag] = [];
        baseCtors.forEach(baseCtor => {
            for (const name of Object.getOwnPropertyNames(baseCtor.prototype)) {
                if (name !== 'constructor' && !Object.getOwnPropertyDescriptor(derivedCtor.prototype, name))
                    Object.defineProperty(
                        derivedCtor.prototype,
                        name,
                        Object.getOwnPropertyDescriptor(baseCtor.prototype, name)
                    );
            }
            if (!arrayUtil.find(mixinCls, baseCtor))
                mixinCls.push(baseCtor);
        });
    }

    applyStaticMixin<T>(derivedCtor: gFrameworkDef.Constructor<T>, baseCtors: gFrameworkDef.Constructor[]) {
        let mixinCls = (derivedCtor as any)[this.staticMixinTag] as gFrameworkDef.Constructor[];
        if (!mixinCls)
            mixinCls = (derivedCtor as any)[this.staticMixinTag] = [];
        baseCtors.forEach(baseCtor => this.assign(derivedCtor, baseCtor));
    }

    assign(target: any, source: any, forceCover?: boolean) {
        for (const k in source) {
            if (source[k] != void 0) {
                if (forceCover)
                    target[k] = source[k];
                else
                    target[k] = target[k] ?? source[k];
            }
        }
    }

    createClassRegister<T = any>() { return new ClassRegister<T>(); }

    private readonly _versionRoot = "$localVersionRoot";
    versionInfo(target: any, versionkey: string) {
        let localVersions = Reflect.get(target, this._versionRoot);
        if (!localVersions)
            Reflect.set(target, this._versionRoot, localVersions = {});
        let version: LocalVersion = localVersions[versionkey];
        if (!version)
            localVersions[versionkey] = version = new LocalVersion();
        return version;
    }

    updateVersion(target: any, versionkey: string) {
        return this.versionInfo(target, versionkey).update();
    }

    curVersion(target: any, versionkey: string) {
        return this.versionInfo(target, versionkey).cur;
    }

    readonly decorators = new class {
        mixin(ctor: gFrameworkDef.Constructor): (ctor: gFrameworkDef.Constructor) => any;
        mixin(prop: Record<string, any>): (ctor: gFrameworkDef.Constructor) => any;
        mixin(arg0: any) {
            if (typeof arg0 === 'function')
                return function (ctor: gFrameworkDef.Constructor) {
                    jsUtil.applyMixins(ctor, [arg0]);
                }

            return function (ctor: gFrameworkDef.Constructor) {
                jsUtil.assign(ctor.prototype, arg0);
            }
        }

        staticMixin(ctor: gFrameworkDef.Constructor): (ctor: gFrameworkDef.Constructor) => any;
        staticMixin(prop: Record<string, any>): (ctor: gFrameworkDef.Constructor) => any;
        staticMixin(arg0: any) {
            if (typeof arg0 === 'function')
                return function (ctor: gFrameworkDef.Constructor) {
                    jsUtil.applyStaticMixin(ctor, [arg0]);
                }

            return function (ctor: gFrameworkDef.Constructor) {
                jsUtil.assign(ctor, arg0);
            }
        }

        setClass(className: string): (ctor: gFrameworkDef.Constructor) => any;
        setClass(ctor: gFrameworkDef.Constructor): void;
        setClass(arg0: any) {
            if (typeof arg0 === 'function')
                return function (ctor: gFrameworkDef.Constructor) {
                    jsUtil.classRegger.setClass(arg0, ctor);
                }
            else
                jsUtil.classRegger.setClass(
                    (arg0 as gFrameworkDef.Constructor).constructor.name,
                    arg0
                );
        }

        singleton<T>(create: () => T): (clazzProto: T, propName: string) => void;
        singleton<T>(clazz: T, propName: string): void;
        singleton(...args: any[]): any {
            if (!args[0].prototype) {
                misc.logger.error("singleton can just be used with static field");
                return;
            }
            if (args.length === 1) {
                return function (clazzProto: any, propName: string) {
                    const staticKey = `_${propName}`;
                    const desc: PropertyDescriptor = {
                        get: function (this: any) {
                            if (!this[staticKey])
                                this[staticKey] = args[0]();
                            return this[staticKey];
                        },
                        set: function (_: any) {
                            misc.logger.error("setter is forbidden");
                        }
                    }
                    return desc as any;
                }
            } else {
                const staticKey = `_${args[1]}`;
                const desc: PropertyDescriptor = {
                    get: function (this: any) {
                        if (!this[staticKey])
                            this[staticKey] = new args[0];
                        return this[staticKey];
                    },
                    set: function (_: any) {
                        misc.logger.error("setter is forbidden");
                    }
                }
                return desc as any;
            }
        }
    }
}

// #region definitions
class ClassInfo<T = any> {
    className: string;
    ctor: gFrameworkDef.Constructor<T>;

    constructor(className: string, ctor: gFrameworkDef.Constructor<T>) {
        this.className = className;
        this.ctor = ctor;
    }

    createIns(...args: gFrameworkDef.ConstructorParameters<gFrameworkDef.Constructor<T>>) {
        return new this.ctor(...args);
    }
}

class ClassRegister<T = any> {
    private _classInfos: Record<string, ClassInfo<T>> = {};

    setClass(className: string, ctor: gFrameworkDef.Constructor<T>) {
        const info = this._classInfos[className] = new ClassInfo<T>(
            className, ctor
        );
        return info;
    }

    getClassByName(className: string) {
        return this._classInfos[className];
    }

    getClassName(ctor: gFrameworkDef.Constructor<T>) {
        for (const k in this._classInfos) {
            const info = this._classInfos[k];
            if (info.ctor === ctor)
                return k;
        }
        return void 0;
    }

    createIns(className: string, ...args: gFrameworkDef.ConstructorParameters<gFrameworkDef.Constructor<T>>) {
        const info = this._classInfos[className];
        return info?.createIns(...args) ?? void 0;
    }
}

class LocalVersion {
    private _cur = 0;

    get cur() { return this._cur; }

    update() {
        return ++this._cur;
    }
}
// #endregion

export const jsUtil = new JsUtil();
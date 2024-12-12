declare namespace gFrameworkDef {
    type Constructor<T = any> = { new(...args: any[]): T };
    type ConstructorParameters<T extends gFrameworkDef.Constructor> = T extends { new(...args: infer R): any } ? R : any[];

    type ResLoadingState = 'initial'|'pending'|'loaded'|'failure';

    interface IResInfo {
        /** 资源的url */
        readonly resUrl: string;
        /** 当前的引用计数 */
        readonly refCount: number;
        /** 是否有效 */
        readonly isValid: boolean;
        /** 资源销毁回调 */
        readonly postDestroy: import('./misc').IDelegate<(info: IResInfo) => void>;
        /** 增加引用 */
        addRef(...args: Parameters<Laya.Resource['_addReference']>): void;
        /** 减少引用 */
        decRef(...args: Parameters<Laya.Resource['_removeReference']>): void;
        /** 获取资源 */
        getRes<T>(): T;
    }

    interface IGenericResInfo<T> extends IResInfo {
        /** 资源 */
        readonly res: T;
        /**
         * @deprecated
         */
        getRes<_T>(): _T;
    }

    interface IComparable<T> {
        /**
         * 与同类对象进行比较
         * @return -1:自身小于other,0:自身和other相等,1：自身大于other
         */
        compare(other: T): -1|0|1;
    }

    interface IEqualable<T> {
        equals(other: T): boolean;
    }
}
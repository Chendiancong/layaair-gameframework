import { misc } from "../..";

export class UIHelper {
    getViewInfo<T extends Laya.Sprite>(clazz: gFrameworkDef.Constructor<T>): IViewRegInfo;
    getViewInfo<T extends Laya.Sprite>(view: T): IViewRegInfo;
    getViewInfo(viewName: string): IViewRegInfo;
    getViewInfo(arg0: any): IViewRegInfo {
        if (typeof arg0 === 'string')
            return this.decorators.getRegInfo(arg0);
        else {
            const viewName = this.getViewName(arg0);
            misc.logger.assert(!!viewName);
            return this.decorators.getRegInfo(viewName);
        }
    }

    getViewName<T extends Laya.Sprite>(clazz: gFrameworkDef.Constructor<T>): string;
    getViewName<T extends Laya.Sprite>(view: T): string;
    getViewName(clazzOrView: gFrameworkDef.Constructor<Laya.Sprite>|Laya.Sprite): string {
        return (clazzOrView as any)[this.decorators.viewNameKey];
    }

    readonly decorators = new class {
        readonly viewNameKey = '$uiViewName';

        private _regInfos = new Map<string, IViewRegInfo>();

        view<T extends Laya.Sprite>(clazz: gFrameworkDef.Constructor<T>): void;
        view(viewName: string): (clazz: gFrameworkDef.Constructor<Laya.Sprite>) => void;
        view(regInfo: IViewRegInfo): (clazz: gFrameworkDef.Constructor<Laya.Sprite>) => void;
        view(arg0: any): any {
            if (typeof arg0 === 'function') {
                this._regView(arg0 as any, { viewName: arg0.name })
            } else if (typeof arg0 === 'string') {
                const that = this;
                return function (clazz: gFrameworkDef.Constructor) {
                    that._regView(clazz, { viewName: arg0 })
                }
            } else {
                const that = this;
                return function (clazz: gFrameworkDef.Constructor) {
                    that._regView(clazz, arg0);
                }
            }
        }

        getRegInfo(key: string) {
            return this._regInfos.get(key);
        }

        private _regView(clazz: gFrameworkDef.Constructor, regInfo: IViewRegInfo) {
            misc.logger.assert(!this._regInfos.get(regInfo.viewName));
            this._regInfos.set(regInfo.viewName, new ViewRegInfo(clazz, regInfo));
            (clazz as any)[this.viewNameKey] = clazz.prototype[this.viewNameKey] = regInfo.viewName;
        }
    }
}

export interface IViewRegInfo {
    viewName: string;
    viewPath?: string;
}

export class ViewRegInfo implements IViewRegInfo {
    viewName: string;
    viewPath?: string;
    viewClazz: gFrameworkDef.Constructor;

    constructor(clazz: gFrameworkDef.Constructor, regInfo: IViewRegInfo) {
        Object.assign(this, regInfo);
        this.viewClazz = clazz;
    }
}

export const uiHelper = new UIHelper();
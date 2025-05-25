import { misc } from "../..";
import { UIView, UIPanel } from "./UIView";

export class UIHelper {
    getViewInfo<T extends UIPanel>(clazz: gFrameworkDef.Constructor<T>): ViewRegInfo;
    getViewInfo<T extends UIPanel>(view: T): ViewRegInfo;
    getViewInfo(viewName: string): ViewRegInfo;
    getViewInfo(arg0: any): ViewRegInfo {
        if (typeof arg0 === 'string')
            return this.decorators.getRegInfo(arg0);
        else {
            const viewName = this.getViewName(arg0);
            misc.logger.assert(!!viewName);
            return this.decorators.getRegInfo(viewName);
        }
    }

    getViewName<T extends UIPanel>(clazz: gFrameworkDef.Constructor<T>): string;
    getViewName<T extends UIPanel>(view: T): string;
    getViewName(clazzOrView: gFrameworkDef.Constructor<UIPanel>|UIPanel): string {
        return (clazzOrView as any)[this.decorators.viewNameKey];
    }

    getUIProps<T extends UIView>(clazz: gFrameworkDef.Constructor<T>): Record<string, UIPropInfo>;
    getUIProps<T extends UIView>(ins: T): Record<string, UIPropInfo>;
    getUIProps(arg0: any): any {
        if (arg0.prototype != void 0)
            return arg0.prototype[this.decorators.propInfosKey];
        else
            return arg0[this.decorators.propInfosKey];
    }

    readonly decorators = new class {
        readonly viewNameKey = '$uiViewName';
        readonly propInfosKey = '$uiPropInfos';

        private _regInfos = new Map<string, ViewRegInfo>();

        view<T extends UIPanel>(clazz: gFrameworkDef.Constructor<T>): void;
        view(viewName: string): (clazz: gFrameworkDef.Constructor<UIPanel>) => void;
        view(regInfo: IViewRegOption): (clazz: gFrameworkDef.Constructor<UIPanel>) => void;
        view(arg0: any): any {
            if (typeof arg0 === 'function')
                this._regView(arg0 as any, { viewName: arg0.name });
            else if (typeof arg0 === 'string') {
                const that = this;
                return function (clazz: gFrameworkDef.Constructor) {
                    that._regView(clazz, { viewName: arg0 });
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

        private _regView(clazz: gFrameworkDef.Constructor, regInfo: IViewRegOption) {
            misc.logger.assert(!this._regInfos.get(regInfo.viewName));
            this._regInfos.set(regInfo.viewName, new ViewRegInfo(clazz, regInfo));
            (clazz as any)[this.viewNameKey] = clazz.prototype[this.viewNameKey] = regInfo.viewName;
        }

        prop<T extends UIView>(clazzProto: T, propName: string): void;
        prop<T extends IUIPropOption, U extends Laya.Node>(info: IUIPropOption): (clazzProto: U, propName: string) => void;
        prop(arg0: any, arg1?: any): any {
            if (typeof arg1 === 'string')
                this._setupPropInfo(arg0, arg1, void 0);
            else {
                const that = this;
                return function<T extends Laya.Node>(clazzProto: T, propName: string) {
                    that._setupPropInfo(clazzProto, propName, arg0);
                }
            }
        }

        private _setupPropInfo(clazzProto: any, propName: string, propInfo: IUIPropOption) {
            let infos = clazzProto[this.propInfosKey];
            if (!infos)
                infos = clazzProto[this.propInfosKey] = {};
            infos[propName] = new UIPropInfo(clazzProto, propName, propInfo);
        }
    }
}

export interface IViewRegOption {
    viewName: string;
    layer?: string|number;
    viewUrl?: string;
}

export class ViewRegInfo implements IViewRegOption {
    viewName: string;
    layer?: string|number;
    viewUrl?: string;
    viewClazz: gFrameworkDef.Constructor<UIView>;

    constructor(clazz: gFrameworkDef.Constructor, regInfo: IViewRegOption) {
        Object.assign(this, regInfo);
        this.viewClazz = clazz;
    }
}

export interface IUIPropOption {
    path?: string;
    recursive?: boolean;
    optional?: boolean;
}

export class UIPropInfo implements IUIPropOption {
    clazzProto: any;
    propName: string;
    path?: string;
    recursive?: boolean;
    optional?: boolean;

    constructor(clazzProto: any, propName: string, propInfo?: IUIPropOption) {
        if (propInfo)
            Object.assign(this, propInfo);
        this.clazzProto = clazzProto;
        this.propName = propName;
    }
}

export const uiHelper = new UIHelper();
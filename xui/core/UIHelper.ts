import { misc } from "../..";
import { jsUtil } from "../../misc";
import { type UIView, type UISubView } from "./UIView";

export class UIHelper {
    @jsUtil.decorators.singleton
    static readonly ins: UIHelper;

    getViewInfo<T extends UIView>(clazz: gFrameworkDef.Constructor<T>): ViewRegInfo;
    getViewInfo<T extends UIView>(view: T): ViewRegInfo;
    getViewInfo(viewName: string): ViewRegInfo;
    getViewInfo(arg0: any): ViewRegInfo {
        if (typeof arg0 === 'string')
            return UIDecorator.ins.getRegInfo(arg0);
        else {
            const viewName = this.getViewName(arg0);
            misc.logger.assert(!!viewName);
            return UIDecorator.ins.getRegInfo(viewName);
        }
    }

    getViewName<T extends UIView>(clazz: gFrameworkDef.Constructor<T>): string;
    getViewName<T extends UIView>(view: T): string;
    getViewName(clazzOrView: gFrameworkDef.Constructor<UIView>|UIView): string {
        return (clazzOrView as any)[UIDecorator.ins.viewNameKey];
    }

    getUIProps<T extends UIView>(clazz: gFrameworkDef.Constructor<T>): Record<string, UIPropInfo>;
    getUIProps<T extends UIView>(ins: T): Record<string, UIPropInfo>;
    getUIProps(arg0: any): any {
        if (arg0.prototype != void 0)
            return arg0.prototype[UIDecorator.ins.propInfosKey];
        else
            return arg0[UIDecorator.ins.propInfosKey];
    }
}

export class UIDecorator {
    @jsUtil.decorators.singleton
    static readonly ins: UIDecorator;

    readonly viewNameKey = '$uiViewName';
    readonly propInfosKey = '$uiPropInfos';

    private _regInfos = new Map<string, ViewRegInfo>();

    view<T extends UIView>(clazz: gFrameworkDef.Constructor<T>): void;
    view(viewName: string): (clazz: gFrameworkDef.Constructor<UIView>) => void;
    view(regInfo: IViewRegOption): (clazz: gFrameworkDef.Constructor<UIView>) => void;
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
    prop<T extends IUIPropOption, U extends UIView>(info: IUIPropOption): (clazzProto: U, propName: string) => void;
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
    optional?: boolean;
    type?: (typeof UISubView)|string;
    comps?: Array<(typeof UISubView)|string>
}

export class UIPropInfo implements IUIPropOption {
    clazzProto: any;
    propName: string;
    path?: string;
    optional?: boolean;
    type?: (gFrameworkDef.Constructor<UISubView>)|string;
    comps?: Array<(gFrameworkDef.Constructor<UISubView>)|string>;

    constructor(clazzProto: any, propName: string, propInfo?: IUIPropOption) {
        if (propInfo)
            Object.assign(this, propInfo);
        this.clazzProto = clazzProto;
        this.propName = propName;
    }
}
import { misc } from "..";
import { WorldComponent } from './WorldComponent';

export type WorldComponentOption = {
    className: string,
    initTickale?: boolean,
    tickDelta?: number,
}


export const worldUtils = new class {
    private _compInfos = new Map<string, ComponentInfo>();

    component<T extends WorldComponent>(clazz: gFrameworkDef.Constructor<T>, option?: WorldComponentOption) {
        const className = innerHelper.convertClassName(clazz, option);
        let curInfo = this._compInfos.get(className);
        if (!curInfo)
            this._compInfos.set(className, new ComponentInfo().setup(clazz, option));
        else
            curInfo.setup(clazz, option);
    }

    getCompInfo<T extends WorldComponent>(ctor: gFrameworkDef.Constructor<T>): ComponentInfo;
    getCompInfo(className: string): ComponentInfo;
    getCompInfo(arg0: string|gFrameworkDef.Constructor): ComponentInfo {
        if (typeof arg0 === 'string')
            return this.getCompInfoByName(arg0);
        else {
            const className = (arg0 as gFrameworkDef.Constructor).prototype[innerHelper.kCompClassName];
            misc.logger.assert(!!className);
            return this.getCompInfoByName(className);
        }
    }

    getCompInfoByName(className: string) {
        const info = this._compInfos.get(className);
        misc.logger.assert(!!info, () => `className:${className},需要先使用worldUtils.component装饰该类才能作为WorldComponent使用`);
        return info;
    }
}

const innerHelper = new class {
    readonly kCompClassName = '$CompClassName';

    convertClassName(clazz: gFrameworkDef.Constructor, option?: WorldComponentOption) {
        return option?.className ?? clazz.constructor.name;
    }
}

class ComponentInfo implements WorldComponentOption {
    ctor: gFrameworkDef.Constructor;

    className: string;

    setup(ctor: gFrameworkDef.Constructor, option: WorldComponentOption) {
        this.ctor = ctor;
        Object.assign(this, option);
        this.className = this.className ?? innerHelper.convertClassName(ctor, option);
        this.ctor.prototype[innerHelper.kCompClassName] = this.className;
        return this;
    }
}
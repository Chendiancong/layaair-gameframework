import { misc } from "..";
import { WorldComponent } from './WorldComponent';

export type WorldComponentOption = {
    className: string,
    initTickable?: boolean,
    tickDelta?: number,
    tickPriority?: number,
}


export const worldUtils = new class {
    readonly emptyOption: WorldComponentOption = {
        className: 'unknown',
        initTickable: true,
        tickDelta: 0,
        tickPriority: 100
    };

    readonly decorators = new class {
        component<T extends WorldComponent>(clazz: gFrameworkDef.Constructor<T>): void;
        component(option: WorldComponentOption): Function;
        component(arg0: any): Function|void {
            if ((arg0 as Function).prototype)
                worldUtils.decorators._regComponent(arg0);
            else
                return function (clazz: gFrameworkDef.Constructor<WorldComponent>) {
                    worldUtils.decorators._regComponent(clazz, arg0);
                }
        }

        private _regComponent(clazz: gFrameworkDef.Constructor, option?: WorldComponentOption) {
            option = this._confirmOption(clazz, option);
            const className = innerHelper.convertClassName(clazz, option);
            let curInfo = worldUtils._compInfos.get(className);
            if (!curInfo)
                worldUtils._compInfos.set(
                    className,
                    curInfo = new ComponentInfo(clazz, option)
                );
            else
                curInfo.setup(clazz, option);
            
            Object.defineProperty(
                clazz.prototype,
                'compOption',
                {
                    get: () => curInfo
                }
            );
        }

        private _confirmOption(clazz: gFrameworkDef.Constructor, origin?: WorldComponentOption) {
            if (!origin) {
                origin = Object.create(worldUtils.emptyOption);
                origin.className = clazz.name;
            }
            return origin;
        }
    }
    private _compInfos = new Map<string, ComponentInfo>();

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
        misc.logger.assert(!!info, () => `className:${className},需要先使用worldUtils.component注册该类才能作为WorldComponent使用`);
        return info;
    }

    componentSorter(a: WorldComponent, b: WorldComponent) {
        const optionA = a.compOption ?? worldUtils.emptyOption;
        const optionB = b.compOption ?? worldUtils.emptyOption;
        return optionA.tickPriority - optionB.tickPriority;
    }
}

const innerHelper = new class {
    readonly kCompClassName = '$CompClassName';

    convertClassName(clazz: gFrameworkDef.Constructor, option?: WorldComponentOption) {
        return option?.className ?? clazz.name;
    }
}

class ComponentInfo implements WorldComponentOption {
    ctor: gFrameworkDef.Constructor;
    className: string;
    private _innerOption: WorldComponentOption;

    get initTickable() { return this._innerOption.initTickable; }
    get tickDelta() { return this._innerOption.tickDelta; }
    get tickPriority() { return this._innerOption.tickPriority; }

    constructor(ctor: gFrameworkDef.Constructor, option: WorldComponentOption) {
        this.setup(ctor, option);
    }

    setup(ctor: gFrameworkDef.Constructor, option: WorldComponentOption) {
        this.ctor = ctor;
        this._innerOption = option;
        this.className = this.className ?? innerHelper.convertClassName(ctor, option);
        this.ctor.prototype[innerHelper.kCompClassName] = this.className;
        return this;
    }
}
const that = this;

export const myGlobal = new class MyGlobal {
    private _globalThis: any;
    private _thiz: Record<string, any> = {};

    get thiz() {
        return this._thiz as Readonly<MyGlobal['_thiz']>;
    }

    get globalThis() {
        if (this._globalThis === void 0) {
            do {
                if (typeof window === 'object') {
                    this._globalThis = window;
                    break;
                }
                if (typeof self === 'object') {
                    this._globalThis = self;
                    break;
                }
                this._globalThis = that;
            } while (false);
        }
        return this._globalThis;
    }

    set(key: string, val: any) {
        this._thiz[key] = val;
    }

    get(key: string) {
        return this._thiz[key];
    }
}

myGlobal.globalThis['myGlobal'] = myGlobal;
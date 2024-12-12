const that = this;

export const myGlobal = new class MyGlobal {
    private _globalThis: any;
    private _record: Record<string, any> = {};

    get record() {
        return this._record as Readonly<MyGlobal['_record']>;
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
        this._record[key] = val;
    }

    get(key: string) {
        return this._record[key];
    }
}

myGlobal.globalThis['myGlobal'] = myGlobal;
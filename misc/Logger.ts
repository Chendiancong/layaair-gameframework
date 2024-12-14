export const logger = new class {
    debug = true;

    log(...args: Parameters<Console['log']>) {
        if (this.debug)
            console.log(...args);
    }

    warn(...args: Parameters<Console['warn']>) {
        console.warn(...args);
    }

    error(...args: Parameters<Console['error']>) {
        console.error(...args);
    }

    assert(flag: boolean, msg?: string|(() => string)) {
        if (!flag) {
            const _msg = msg !== void 0 ?
                typeof msg === 'function' ? msg() : msg :
                'asset fail!';
            throw new Error(_msg);
        }
    }
}
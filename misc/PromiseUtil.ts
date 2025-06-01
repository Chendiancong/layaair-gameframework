export const promiseUtil = new class {
    createDefer<T>() {
        return new PromiseDeferer<T>();
    }

    async listPromisify<Value, Result = any>(list: Value[], handler: (v: Value) => Promise<Result>): Promise<Result[]> {
        const tasks = list.map(v => handler(v));
        return await Promise.all(tasks);
    }
}

export class PromiseDeferer<T = void> {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (err?: any) => void;

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}
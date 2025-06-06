export const promiseUtil = new class {
    createDefer<T>() {
        return new PromiseDeferer<T>();
    }

    async listPromisify<Value, Result = any>(list: Value[], handler: (v: Value) => Promise<Result>): Promise<Result[]> {
        const tasks = list.map(v => handler(v));
        return await Promise.all(tasks);
    }

    async sequence<T extends readonly unknown[] | []>(values: T): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
        let results: any[] = [];
        for (const v of values)
            results.push(await v);
        return results as any;
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
export const promiseUtil = new class {
    createDefer<T>() {
        return new PromiseDeferer<T>();
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
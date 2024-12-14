interface ILifeCycle {
    /** 是否激活 */
    enabled: boolean;

    /** 初始化时 */
    onIntial?(): void;
    /** 开始时 */
    onStart?(): void;
    /** 步进 */
    onTick?(dt: number): void;
    /** 激活时 */
    onEnable?(): void;
    /** 禁用时 */
    onDisable?(): void;
    /** 被摧毁时 */
    onDestroy?(): void;
}

export class WorldComponent implements ILifeCycle {
    private _enabled: boolean;

    get enabled() { return this._enabled; }
    set enabled(value: boolean) {
        if (value !== this._enabled) {
            this._enabled = value;
            this.invokeLifeCycle(value ? 'onEnable' : 'onDisable')
        }
    }

    onIntial?(): void;
    onStart?(): void;
    onTick?(dt: number): void;
    onEnable?(): void;
    onDisable?(): void;
    onDestroy?(): void;

    protected invokeLifeCycle<K extends gFrameworkDef.KeyWithType<ILifeCycle, Function>>(funName: K, ...args: Parameters<ILifeCycle[K]>) {
        (Object.getPrototypeOf(this)[funName] as Function).call(this, ...args);
    }
}
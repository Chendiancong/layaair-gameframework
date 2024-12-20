export interface IWorldLifeCycle {
    /** 是否激活 */
    enabled: boolean;
    /** 生命周期状态 */
    lcState: WorldLifeCycleState;

    /** 初始化时 */
    onInitial?(): void;
    /** 开始时，首次执行tick之前 */
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

export const enum WorldLifeCycleState {
    None,
    Initialized = 1,
    Started = Initialized << 1,
    Enabled = Started << 1,
    Destroyed = Enabled << 1,
}

export function invokeLifeCycle<T extends IWorldLifeCycle, K extends gFrameworkDef.KeyWithType<IWorldLifeCycle, Function>>(target: T, funName: K, ...args: Parameters<IWorldLifeCycle[K]>) {
    (Object.getPrototypeOf(target)[funName] as Function).call(target, ...args);
}

export const lifeCycleHelper = new class {
    checkState(lifeCycle: IWorldLifeCycle, targetState: WorldLifeCycleState) {
        return !!(lifeCycle.lcState&targetState);
    }

    setState(lifeCycle: IWorldLifeCycle, targetState: WorldLifeCycleState) {
        lifeCycle.lcState |= targetState;
    }

    unsetState(lifeCycle: IWorldLifeCycle, targetState: WorldLifeCycleState) {
        lifeCycle.lcState &= ~targetState;
    }

    invoke<T extends IWorldLifeCycle, K extends gFrameworkDef.KeyWithType<IWorldLifeCycle, Function>>(lifeCycle: T, funName: K, ...args: Parameters<IWorldLifeCycle[K]>) {
        (Object.getPrototypeOf(lifeCycle)[funName] as Function).call(lifeCycle, ...args);
    }
}
import { type WorldEntity } from "./WorldEntity";
import { WorldComponentOption, worldUtils } from "./WorldUtils";

interface IComponentLifeCycle {
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

export const enum WorldComponentState {
    None = 0,
    Started = 1,
    Destroyed = Started << 1,
    Enabled = Destroyed << 1,
}

export class WorldComponent implements IComponentLifeCycle {
    tickDelta = 0;
    readonly entity: WorldEntity = void 0;
    readonly compOption?: WorldComponentOption;
    private _enabled: boolean;
    private _tickPriority: number;
    private _innerState = WorldComponentState.None;

    get enabled() { return this._enabled; }
    set enabled(value: boolean) {
        if (value !== this._enabled) {
            this._enabled = value;
            this.invokeLifeCycle(value ? 'onEnable' : 'onDisable')
        }
    }

    get tickPriority() { return this._tickPriority; }
    set tickPriority(value: number) {
        if (this._tickPriority === value)
            return;
        this._tickPriority = value;
    }

    get isOnStartCalled() { return this.checkInnerState(WorldComponentState.Started); }
    get isDestroyed() { return this.checkInnerState(WorldComponentState.Destroyed); }

    onIntial?(): void;
    onStart?(): void;
    onTick?(dt: number): void;
    onEnable?(): void;
    onDisable?(): void;
    onDestroy?(): void;

    constructor() {
        const emptyOption = worldUtils.emptyOption;
        const option = this.compOption;
        this._enabled = option?.initTickable ?? emptyOption.initTickable;
        this.tickDelta = option?.tickDelta ?? emptyOption.tickDelta;
        this._tickPriority = option?.tickPriority ?? emptyOption.tickPriority;
        this.invokeLifeCycle('onIntial');
    }

    destroy() {
        if (this.entity)
            this.entity.removeComponent(this);
        else
            this.internalDestroy();
    }

    /**
     * @deprecated internal
     */
    checkInnerState(targetState: WorldComponentState) {
        return (this._innerState&targetState) === targetState;
    }

    /**
     * @deprecated internal
     */
    setInnerState(targetState: WorldComponentState) {
        this._innerState |= targetState;
    }

    /**
     * @deprecated internal
     */
    unsetInnerState(targetState: WorldComponentState) {
        this._innerState &= ~targetState;
    }

    /**
     * @deprecated internal
     */
    internalDestroy() {
        this.setInnerState(WorldComponentState.Destroyed);
        this.invokeLifeCycle('onDestroy');
    }

    /**
     * @deprecated internal
     */
    invokeLifeCycle<K extends gFrameworkDef.KeyWithType<IComponentLifeCycle, Function>>(funName: K, ...args: Parameters<IComponentLifeCycle[K]>) {
        (Object.getPrototypeOf(this)[funName] as Function).call(this, ...args);
    }
}
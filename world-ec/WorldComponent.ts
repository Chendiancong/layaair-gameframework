import { type WorldEntity } from "./WorldEntity";
import { invokeLifeCycle, IWorldLifeCycle, lifeCycleHelper, WorldLifeCycleState } from "./WorldLifeCycle";
import { WorldComponentOption, worldUtils } from "./WorldUtils";

export class WorldComponent implements IWorldLifeCycle {
    readonly compOption?: WorldComponentOption;

    tickDelta = 0;
    entity: WorldEntity = void 0;
    lcState = WorldLifeCycleState.None;
    private _uid = WorldComponent._nextGuid;
    private _enabled: boolean;
    private _tickPriority: number;

    private static _guid = 0;
    private static get _nextGuid() { return ++this._guid; }

    get compUid() { return this._uid; }

    get enabled() { return lifeCycleHelper.checkState(this, WorldLifeCycleState.Enabled); }
    set enabled(value: boolean) {
        if (value !== this.enabled) {
            if (value)
                lifeCycleHelper.setState(this, WorldLifeCycleState.Enabled);
            else
                lifeCycleHelper.unsetState(this, WorldLifeCycleState.Enabled);
            this._enableChanged();
        }
    }

    get tickPriority() { return this._tickPriority; }
    set tickPriority(value: number) {
        if (this._tickPriority === value)
            return;
        this._tickPriority = value;
    }

    get isStarted() { return lifeCycleHelper.checkState(this, WorldLifeCycleState.Started); }
    get isDestroyed() { return lifeCycleHelper.checkState(this, WorldLifeCycleState.Destroyed); }

    onInitial?(): void;
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
        invokeLifeCycle(this, 'onInitial');
        this._enableChanged();
    }

    destroy() {
        if (this.entity)
            this.entity.removeComponent(this);
        else
            this._internalDestroy();
    }

    /**
     * @deprecated internal
     */
    _internalDestroy() {
        lifeCycleHelper.setState(this, WorldLifeCycleState.Destroyed);
        invokeLifeCycle(this, 'onDestroy');
    }

    private _enableChanged() {
        if (this._enabled)
            invokeLifeCycle(this, 'onEnable');
        else
            invokeLifeCycle(this, 'onDisable');
    }
}
import { misc } from "..";
import { type WorldEntity } from "./WorldEntity";
import { IWorldLifeCycle, lifeCycleHelper, WorldLifeCycleState } from "./WorldLifeCycle";
import { WorldComponentOption, worldUtils } from "./WorldUtils";

export class WorldComponent implements IWorldLifeCycle {
    readonly compOption?: WorldComponentOption;

    tickDelta = 0;
    lcState = WorldLifeCycleState.None;
    private _entity: WorldEntity = void 0;
    private _uid = WorldComponent._nextGuid;
    private _tickPriority: number;

    private static _guid = 0;
    private static get _nextGuid() { return ++this._guid; }

    get compUid() { return this._uid; }
    get entity() { return this._entity; }

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
        const option = this.compOption ?? worldUtils.emptyOption;
        this.tickDelta = option.tickDelta;
        this._tickPriority = option.tickPriority;
        if (option.initTickable)
            lifeCycleHelper.setState(this, WorldLifeCycleState.Enabled);
        else
            lifeCycleHelper.unsetState(this, WorldLifeCycleState.Enabled);
    }

    destroy() {
        if (this._entity)
            this._entity.removeComponent(this);
        else
            this._internalDestroy();
    }

    /**
     * @deprecated internal
     */
    _internalInit(e: WorldEntity) {
        this._entity = e;
        this.onInitial?.call(this);
        this._enableChanged();
    }

    /**
     * @deprecated internal
     */
    _internalDestroy() {
        this.enabled = false;
        this._setEntity(void 0);
        lifeCycleHelper.setState(this, WorldLifeCycleState.Destroyed);
        this.onDestroy?.call(this);
    }

    /**
     * @deprecated internal
     */
    _setEntity(e: WorldEntity) {
        this._entity = e;
    }

    /**
     * @deprecated internal
     */
    _enableChanged() {
        // if (lifeCycleHelper.checkState(this, WorldLifeCycleState.Enabled))
        //     this.onEnable?.call(this);
        // else
        //     this.onDisable?.call(this);
    }
}
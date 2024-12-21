import { misc } from "..";
import { type World } from "./World";
import { WorldComponent } from "./WorldComponent";
import { IWorldLifeCycle, lifeCycleHelper, WorldLifeCycleState } from "./WorldLifeCycle";
import { worldUtils } from "./WorldUtils";

const enum ExtraState {
    None,
    SortComponents = 1,
}

export class WorldEntity implements IWorldLifeCycle {
    lcState = WorldLifeCycleState.None;
    private _entityId = WorldEntity._nextGuid;
    private _world: World;
    private _components: WorldComponent[] = [];
    private _willRunningComponents: WorldComponent[] = [];
    private _runningComponents: WorldComponent[] = [];
    private _sleepingComponents: WorldComponent[] = [];
    private _extraState = ExtraState.None;

    get components(): ReadonlyArray<WorldComponent> {
        return this._components;
    }
    get entityId() { return this._entityId; }
    get world() { return this._world; }

    get enabled() { return lifeCycleHelper.checkState(this, WorldLifeCycleState.Enabled); }
    set enabled(val: boolean) {
        if (this.enabled !== val) {
            if (val)
                lifeCycleHelper.setState(this, WorldLifeCycleState.Enabled);
            else
                lifeCycleHelper.unsetState(this, WorldLifeCycleState.Enabled);
            this._enableChanged();
        }
    }

    private static _guid = 1;
    private static get _nextGuid() { return ++this._guid; }

    addComponent<T extends WorldComponent>(ctor: gFrameworkDef.Constructor<T>): T;
    addComponent<T extends WorldComponent = WorldComponent>(className: string): T;
    addComponent<T extends WorldComponent>(comp: T): T;
    addComponent(arg0: string|gFrameworkDef.Constructor<WorldComponent>|WorldComponent): WorldComponent {
        let comp: WorldComponent;
        if (typeof arg0 === 'string') {
            comp = this._createComponent(arg0);
            this._addComponent(comp);
        } else if (!!(arg0 as gFrameworkDef.Constructor).prototype) {
            comp = this._createComponent(arg0 as gFrameworkDef.Constructor);
            this._addComponent(comp);
        } else {
            comp = arg0 as any;
            if (!this._components.includes(comp))
                this._addComponent(comp);
        }
        return comp;
    }

    removeComponent<T extends WorldComponent>(comp: T) {
        if (this._components.includes(comp)) {
            misc.jsUtil.arrayRemove(this._components, comp);
            misc.jsUtil.arrayRemove(this._willRunningComponents, comp);
            misc.jsUtil.arrayRemove(this._runningComponents, comp);
            misc.jsUtil.arrayRemove(this._sleepingComponents, comp);
            comp._internalDestroy();
        }
    }

    removeAllComponents() {
        const comps = this._components.concat();
        this._components.length = 0;
        this._willRunningComponents.length = 0;
        this._runningComponents.length = 0;
        this._sleepingComponents.length = 0;
        comps.forEach(c => c._internalDestroy());
    }

    destroy() {
        this._world.destroyEntity(this);
    }

    /**
     * @deprecated internal
     */
    _internalInit(w: World) {
        misc.logger.assert(!!w);
        this._world = w;
        this.onInitial?.call(this);
        this.enabled = true;
    }

    /**
     * @deprecated internal
     */
    _internalDestroy() {
        if (this.enabled)
            this.enabled = false;
        this.removeAllComponents();
        lifeCycleHelper.setState(this, WorldLifeCycleState.Destroyed);
        this.onDestroy?.call(this);
    }

    /**
     * @deprecated internal
     */
    _internalTick(dt: number): void {
        if (!lifeCycleHelper.checkState(this, WorldLifeCycleState.Enabled))
            return;
        this._handleSleepings();
        this._handleWillRunnings();
        this._handleRunnings(dt);
        this.onTick?.call(this, dt);
    }

    onInitial?(): void;
    onStart?(): void;
    onTick?(dt: number): void;
    onEnable?(): void;
    onDisable?(): void;
    onDestroy?(): void;

    private _handleSleepings() {
        const comps = this._sleepingComponents;
        let changed = false;
        for (let i = 0, len = comps.length; i < len; ++i) {
            const comp = comps[i];
            if (comp.enabled) {
                if (!comp.isStarted)
                    this._willRunningComponents.push(comp);
                else
                    this._runningComponents.push(comp);
                this._extraState |= ExtraState.SortComponents;
                comps[i] = void 0;
                changed = true;
            }
        }
        if (changed)
            misc.jsUtil.arrayRemove(comps, void 0);
    }

    private _handleWillRunnings() {
        const comps = this._willRunningComponents;
        let changed = false;
        for (let i = 0, len = comps.length; i < len; ++i) {
            const comp = comps[i];
            lifeCycleHelper.setState(comp, WorldLifeCycleState.Started);
            comp.onStart?.call(this);
            
            this._runningComponents.push(comp);
            this._extraState |= ExtraState.SortComponents;
            comps[i] = void 0;
            changed = true;
        }
        if (changed)
            misc.jsUtil.arrayRemove(comps, void 0);
    }

    private _handleRunnings(dt: number) {
        const comps = this._runningComponents;
        if (this._extraState&ExtraState.SortComponents)
            comps.sort(worldUtils.componentSorter);
        let changed = false;
        for (let i = 0, len = comps.length; i < len; ++i) {
            const comp = comps[i];
            if (!comp.enabled) {
                this._sleepingComponents.push(comp);
                comps[i] = void 0;
                changed = true;
            } else
                comp.onTick?.call(comp, dt);
        }
        if (changed)
            misc.jsUtil.arrayRemove(comps, void 0);
    }

    private _createComponent(nameOrCtor: string|gFrameworkDef.Constructor<WorldComponent>): WorldComponent {
        const info = worldUtils.getCompInfo(nameOrCtor as any);
        return new info.ctor();
    }

    private _addComponent(comp: WorldComponent) {
        this._components.push(comp);
        if (comp.enabled)
            this._willRunningComponents.push(comp);
        else
            this._sleepingComponents.push(comp);
        comp._internalInit(this);
    }

    private _enableChanged() {
        if (this.enabled)
            this.onEnable?.call(this);
        else
            this.onDisable?.call(this);
    }
}
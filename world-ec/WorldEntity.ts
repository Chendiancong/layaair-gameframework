import { misc } from "..";
import { WorldComponent, WorldComponentState } from "./WorldComponent";
import { worldUtils } from "./WorldUtils";

export const enum WorldEntityState {
    None = 0,
    Running = 1,
    Destroyed = Running << 1,
    SortComponents = Destroyed << 1,
}

export class WorldEntity {
    private _innerState = WorldEntityState.Running;
    private _components: WorldComponent[] = [];
    private _toStartComponents: WorldComponent[] = [];
    private _runningComponents: WorldComponent[] = [];
    private _sleepingComponents: WorldComponent[] = [];

    get components(): ReadonlyArray<WorldComponent> {
        return this._components;
    }

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
            misc.jsUtil.arrayRemove(this._toStartComponents, comp);
            misc.jsUtil.arrayRemove(this._runningComponents, comp);
            misc.jsUtil.arrayRemove(this._sleepingComponents, comp);
        }
    }

    /**
     * @deprecated internal
     */
    internalTick(dt: number): void {
        this._handleSleepings();
        this._handleToStarts();
        this._handleRunnings();
        if (this.tick)
            this.tick(dt);
    }

    tick?(dt?: number): void;

    private _handleSleepings() {
        const comps = this._sleepingComponents;
        for (let i = 0, len = comps.length; i < len; ++i) {
            const comp = comps[i];
            if (comp.enabled) {
                if (!comp.isOnStartCalled)
                    this._toStartComponents.push(comp);
                else
                    this._runningComponents.push(comp);
                this._innerState |= WorldEntityState.SortComponents;
            }
        }
    }

    private _handleToStarts() {
        const comps = this._toStartComponents;
        for (let i = 0, len = comps.length; i < len; ++i) {
            const comp = comps[i];
            comp.invokeLifeCycle('onStart');
            comp.setInnerState(WorldComponentState.Started);
            this._runningComponents.push(comp);
            this._innerState |= WorldEntityState.SortComponents;
        }
    }

    private _handleRunnings() {
        const comps = this._runningComponents;
        if (this._innerState&WorldEntityState.SortComponents) {
        }
        for (let i = 0, len = comps.length; i < len; ++i) {

        }
    }

    private _createComponent(nameOrCtor: string|gFrameworkDef.Constructor<WorldComponent>): WorldComponent {
        const info = worldUtils.getCompInfo(nameOrCtor as any);
        return new info.ctor();
    }

    private _addComponent(comp: WorldComponent) {
        this._components.push(comp);
        if (comp.enabled)
            this._toStartComponents.push(comp);
        else
            this._sleepingComponents.push(comp);
    }
}
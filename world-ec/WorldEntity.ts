import { WorldComponent } from "./WorldComponent";
import { worldUtils } from "./WorldUtils";

export class WorldEntity {
    private _components: WorldComponent[] = [];
    private _toStartComponents: WorldComponent[] = [];
    private _runningComponents: WorldComponent[] = [];

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
            this._components.push(comp);
        } else if (!!(arg0 as gFrameworkDef.Constructor).prototype) {
            comp = this._createComponent(arg0 as gFrameworkDef.Constructor);
            this._components.push(comp);
        } else {
            comp = arg0 as any;
            if (!this._components.includes(comp))
                this._components.push(comp);
        }
        return comp;
    }

    /**
     * @deprecated internal
     */
    internalTick(dt: number): void {
    }

    private _createComponent(nameOrCtor: string|gFrameworkDef.Constructor<WorldComponent>): WorldComponent {
        const info = worldUtils.getCompInfo(nameOrCtor as any);
        return new info.ctor();
    }
}
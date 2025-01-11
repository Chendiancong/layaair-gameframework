import { misc } from "..";
import { WorldEntity } from "./WorldEntity";

export class World {
    private _entities: WorldEntity[] = [];
    private _id2Entities = new Map<number, WorldEntity>();

    get entities() { return this._entities; }

    createEntity<T extends gFrameworkDef.Constructor<WorldEntity>>(ctor: T, ...args: gFrameworkDef.ConstructorParameters<T>): InstanceType<T> {
        const e = new ctor(...args);
        this._entities.push(e);
        this._id2Entities.set(e.entityId, e);
        e._internalInit(this);
        return e as any;
    }

    destroyEntity<T extends WorldEntity>(e: T) {
        // if (this._id2Entities.get(e.entityId)) {
        //     misc.jsUtil.arrayRemove(this._entities, e);
        //     this._id2Entities.delete(e.entityId);
        //     e._internalPreDestroy();
        // }
        if (this._id2Entities.get(e.entityId)) {
            e._internalPreDestroy();
        }
    }

    tick(dt: number) {
        for (let i = 0, len = this._entities.length; i < len; ++i)
            this._entities[i]._internalTick(dt);
    }

    /**
     * @deprecated internal
     */
    _disposeEntity(e: WorldEntity) {
        if (this._id2Entities.get(e.entityId)) {
            misc.jsUtil.arrayRemove(this._entities, e);
            this._id2Entities.delete(e.entityId);
        }
    }
}
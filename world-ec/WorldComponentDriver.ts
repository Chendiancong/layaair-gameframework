import { misc } from "..";
import { WorldComponent } from "./WorldComponent";

export interface IWorldComponentDriver {
    tick(dt: number): void;
    add(comp: WorldComponent): void;
    delete(comp: WorldComponent): void;
    clear(): void;
}

interface IInnerDriver {
    readonly sleepingQueue: ComponentQueue;
    readonly onDisableQueue: ComponentQueue;
    readonly onEnableQueue: ComponentQueue;
    readonly onStartQueue: ComponentQueue;
    readonly onTickQueue: ComponentQueue;
}

export function createDriver() {
    return new Driver() as IWorldComponentDriver;
}

class Driver implements IWorldComponentDriver, IInnerDriver {
    sleepingQueue = new SleepingQueue();
    onDisableQueue = new OnDisableQueue();
    onEnableQueue = new OnEnableQueue();
    onStartQueue = new OnStartQueue();
    onTickQueue = new OnTickQueue();
    private _queues: ComponentQueue[] = [
        this.sleepingQueue,
        this.onDisableQueue,
        this.onEnableQueue,
        this.onStartQueue,
        this.onTickQueue
    ]

    tick(dt: number) {
        const queues = this._queues;
        for (let i = 0, len = queues.length; i < len; ++i) {
            const q = queues[i];
            if (q.list.length)
                q.tick(this, dt);
        }
    }

    add(comp: WorldComponent) {
        this.sleepingQueue.add(comp);
    }

    delete(comp: WorldComponent) {
        const queues = this._queues;
        for (let i = 0, len = queues.length; i < len; ++i)
            queues[i].delete(comp);
    }

    clear() {
        const queues = this._queues;
        for (let i = 0, len = queues.length; i < len; ++i)
            queues[i].clear();
    }
}

abstract class ComponentQueue {
    list: WorldComponent[] = [];
    dummy: boolean;

    abstract tick(driver: IInnerDriver, dt: number): void;

    add(comp: WorldComponent) {
        this.list.push(comp);
        this.dummy = true;
    }

    delete(comp: WorldComponent) {
        const originLen = this.list.length;
        misc.jsUtil.arrayRemove(this.list, comp);
        if (originLen !== this.list.length)
            comp.onDestroy?.call(comp);
    }

    clear() {
        try {
            const list = this.list;
            for (let i = 0, len = list.length; i < len; ++i) {
                list[i].onDestroy?.call(list[i]);
            }
        } catch (e) {
            throw e;
        } finally {
            this.list.length = 0;
        }
    }

    sort() {
        this.list.sort(ComponentQueue.sorter);
        this.dummy = false;
    }

    static sorter(a: WorldComponent, b: WorldComponent): number {
        return b.tickPriority - a.tickPriority;
    }
}

class SleepingQueue extends ComponentQueue {
    tick(driver: IInnerDriver, dt: number): void {
        const l = this.list;
        let changed = false;
        for (let i = 0, len = l.length; i < len; ++i) {
            if (l[i].enabled) {
                driver.onEnableQueue.add(l[i]);
                l[i] = void 0
                changed = true;
            }
        }
        if (changed)
            misc.jsUtil.arrayRemove(l, void 0);
    }
}

class OnDisableQueue extends ComponentQueue {
    tick(driver: IInnerDriver, dt: number) {
        const l = this.list;
        if (this.dummy)
            this.sort();
        for (let i = 0, len = l.length; i < len; ++i) {
            l[i].onDisable?.call(l[i]);
            driver.sleepingQueue.add(l[i]);
        }
        l.length = 0;
    }
}

class OnEnableQueue extends ComponentQueue {
    tick(driver: IInnerDriver, dt: number) {
        const l = this.list;
        if (this.dummy)
            this.sort();
        for (let i = 0, len = l.length; i < len; ++i) {
            l[i].onEnable?.call(l[i]);
            if (l[i].isStarted)
                driver.onTickQueue.add(l[i]);
            else
                driver.onStartQueue.add(l[i]);
        }
        l.length = 0;
    }
}

class OnStartQueue extends ComponentQueue {
    tick(driver: IInnerDriver, dt: number) {
        const l = this.list;
        if (this.dummy)
            this.sort();
        for (let i = 0, len = l.length; i < len; ++i) {
            l[i].onStart?.call(this);
            driver.onTickQueue.add(l[i]);
        }
        l.length = 0;
    }
}

class OnTickQueue extends ComponentQueue {
    tick(driver: IInnerDriver, dt: number) {
        const l = this.list;
        if (this.dummy)
            this.sort();
        let changed = false;
        for (let i = 0, len = l.length; i < len; ++i) {
            const comp = l[i];
            if (comp.enabled)
                comp.onTick?.call(this, dt);
            if (!comp.enabled) {
                l[i] = void 0;
                changed = true;
                driver.onDisableQueue.add(comp);
            }
        }
        if (changed)
            misc.jsUtil.arrayRemove(l, void 0);
    }
}
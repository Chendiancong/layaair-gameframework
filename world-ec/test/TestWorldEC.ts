import { misc } from "../..";
import { World } from "../World";
import { WorldComponent } from "../WorldComponent";
import { WorldEntity } from "../WorldEntity";
import { worldUtils } from "../WorldUtils";

@Laya.regClass()
export class TestWorldEC extends Laya.Script {
    declare owner: Laya.Sprite;
    private _world: World;

    onStart(): void {
        const world = this._world = new World();
        const e = world.createEntity(MyEntity);
        e.addComponent(MyComponent);
    }

    onUpdate(): void {
        this._world.tick(Laya.timer.delta);
    }
}

class MyEntity extends WorldEntity {
    onInitial(): void {
        misc.logger.log('my component on initial');
    }
}

@worldUtils.decorators.component
class MyComponent extends WorldComponent {
    onInitial(): void {
        misc.logger.log('my component on initial');
    }

    private _counter: number = 0;
    onTick(dt: number): void {
        misc.logger.log('my component on tick');
        ++this._counter;
        if (this._counter >= 60)
            this.destroy();
    }

    onDestroy(): void {
        misc.logger.log('my component destroy');
    }
}
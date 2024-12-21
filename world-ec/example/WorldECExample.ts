import { misc } from "../..";
import { World } from "../World";
import { WorldComponent } from "../WorldComponent";
import { WorldEntity } from "../WorldEntity";
import { worldUtils } from "../WorldUtils";

const { regClass } = Laya;

@regClass()
export class WorldECExample extends Laya.Script {
    //declare owner : Laya.Sprite3D;
    declare owner : Laya.Sprite;
    world: World;

    onStart(): void {
        this.world = new World();
        const e = this.world.createEntity(MyEntity);
        e.addComponent(MyComponent);
        misc.myGlobal.set('exampleWorld', this.world);
    }

    onUpdate(): void {
        this.world.tick(Laya.timer.delta);
    }

    //组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
    //onAwake(): void {}

    //组件被启用后执行，例如节点被添加到舞台后
    //onEnable(): void {}

    //组件被禁用时执行，例如从节点从舞台移除后
    //onDisable(): void {}

    //第一次执行update之前执行，只会执行一次
    //onStart(): void {}

    //手动调用节点销毁时执行
    //onDestroy(): void {}

    //每帧更新时执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
    //onUpdate(): void {}

    //每帧更新时执行，在update之后执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
    //onLateUpdate(): void {}

    //鼠标点击后执行。与交互相关的还有onMouseDown等十多个函数，具体请参阅文档。
    //onMouseClick(): void {}
}

class MyEntity extends WorldEntity {
    onInitial(): void {
        misc.logger.log('my entity on initial');
    }

    onStart(): void {
        misc.logger.log('my entity on start');
    }

    onEnable(): void {
        misc.logger.log('my entity on enable');
    }

    onDisable(): void {
        misc.logger.log('my entity on disable');
    }

    onDestroy(): void {
        misc.logger.log('my entity on destroy');
    }
}

@worldUtils.decorators.component
class MyComponent extends WorldComponent {
    curEntity: WorldEntity;
    counter = 0;

    onInitial(): void {
        misc.logger.log('my component on initial');
        this.curEntity = this.entity;
    }

    onEnable(): void {
        misc.logger.log('my component on enable');
    }

    onDisable(): void {
        misc.logger.log('my component on disable');
    }

    onDestroy(): void {
        misc.logger.log('my component on destroy');
        this.curEntity.destroy();
    }

    onTick(dt: number): void {
        ++this.counter;
        misc.logger.log('my component on tick', this.counter);
        if (this.counter >= 60)
            this.destroy();
    }
}
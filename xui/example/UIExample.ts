import { asProp, asView } from "..";
import { misc } from "../..";
import { UISubView, UIPanel } from "../core/UIView";
import { IViewLayerConfig, ViewLayerMgr } from "../core/ViewLayerMgr";
import { ViewMgr } from "../core/ViewMgr";

const { regClass, property } = Laya;

enum EnumUILayer {
    Base,
    Window,
    Popup,
    Tips,
    Count,
}

class LayerConfig implements IViewLayerConfig<EnumUILayer> {
    get defaultLayer() { return EnumUILayer.Window; }

    *allLayers() {
        for (let layer = EnumUILayer.Base; layer < EnumUILayer.Count; ++layer)
            yield layer;
    }

    layerToName(layer: EnumUILayer): string {
        return EnumUILayer[layer];
    }

    nameToLayer(name: keyof typeof EnumUILayer): EnumUILayer {
        return EnumUILayer[name];
    }
}

@regClass()
export class UIExample extends Laya.Script {
    declare owner : Laya.Sprite;
    @property({ type: Laya.Button })
    declare showUIBtn: Laya.Button;
    private _layerMgr: ViewLayerMgr<EnumUILayer>;
    private _viewMgr: ViewMgr;

    onAwake(): void {
        this._layerMgr = new ViewLayerMgr(new LayerConfig());
        const root = new Laya.UIComponent();
        root.name = "UIRoot";
        root.left = root.right = root.bottom = root.top = 0;
        const scene2d = Laya.Scene.root.getChildByName("Scene2D");
        scene2d.addChild(root);
        this._viewMgr = new ViewMgr(root, this._layerMgr);
        this.showUIBtn.on(Laya.Event.CLICK, () => this._viewMgr.open(MyPanel, "from UIExample"));
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

@asView("MySubView")
class MySubView extends UISubView {
    @asProp
    title: Laya.Label;
    @asProp
    infoButton: Laya.Button;

    afterInit(): void {
        this.title.text = "AfterInit";
        this.onClick(this.infoButton, () => misc.logger.log("info button"));
    }
}

@asView("MySubComp")
class MySubComp extends UISubView {
    @asProp
    title: Laya.Label;
    @asProp
    image: Laya.Image;

    afterInit() {
        let cnt = 0;
        this.asSprite.timerLoop(1000, this, () => {
            this.title.text = `time loop ${++cnt}`
            if (cnt === 3) {
                this.showIconWith(this.image, "resources/layaAir.png")
            }
        });
    }
}

@asView({
    viewName: "MyPanel",
    layer: EnumUILayer.Window,
    viewUrl: "resources/ui/MyPanel.lh"
})
class MyPanel extends UIPanel {
    @asProp
    closeBtn: Laya.Button;
    @asProp({ type: MySubView, comps: [MySubComp] })
    subView: MySubView;

    onOpen(msg: string): void {
        misc.logger.log("MyPanel onOpen:", msg);

        this.onClick(this.closeBtn, () => {
            misc.logger.log("MyPanel closeBtn clicked");
            this.closeSelf();
        });
        misc.logger.log("subview", this.subView);
    }

    onClose(): void {
        misc.logger.log("MyPanel onClose");
    }
}
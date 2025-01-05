import { misc } from "../..";
import { ViewRegInfo } from "./UIHelper";
import { ViewMgr } from "./ViewMgr";

export class ViewCtrl {
    viewMgr: ViewMgr;
    viewNode: Laya.Sprite;
    viewInfo: ViewRegInfo;

    constructor(viewMgr: ViewMgr, viewInfo: ViewRegInfo) {
        this.viewInfo = viewInfo;
        misc.logger.assert(!!viewInfo.viewName);
        this.viewMgr = viewMgr;
        this.viewNode = new Laya.Sprite();
        this.viewNode.name = viewInfo.viewName;
    }
}
export const layaExtends = new class {
    isValid(target: Laya.Node|Laya.Component|Laya.Resource) {
        return target != void 0 && !target.destroyed;
    }

    fullsize(comp: Laya.UIComponent) {
        comp.left = comp.right = comp.bottom = comp.top = 0;
    }

    center(comp: Laya.UIComponent) {
        comp.centerX = comp.centerY = 0;
    }
}
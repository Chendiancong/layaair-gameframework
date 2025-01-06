export const layaExtends = new class {
    isValid(target: Laya.Node|Laya.Component|Laya.Resource) {
        return target != void 0 && !target.destroyed;
    }
}
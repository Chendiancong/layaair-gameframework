export const arrayUtil = new class {
    arrayFind<T>(arr: T[], target: T, equals?: (a: T, b: T) => boolean): T {
        let hasEquals = equals != void 0;
        if (hasEquals) {
            for (let i = 0, il = arr.length; i < il; ++i) {
                if (equals(arr[i], target))
                    return arr[i];
            }
        } else {
            for (let i = 0, il = arr.length; i < il; ++i) {
                if (arr[i] === target)
                    return arr[i];
            }
        }
    }
}
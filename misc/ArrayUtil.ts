export const arrayUtil = new class {
    find<T>(arr: T[], target: T): T {
        for (let i = 0, il = arr.length; i < il; ++i) {
            if (arr[i] === target)
                return arr[i];
        }
    }

    /** 原地删除元素 */
    remove<T>(arr: T[], target: T) {
        let i = 0, j = 0, len = arr.length;
        while (i < len) {
            if (arr[i] !== target)
                arr[j++] = arr[i];
        }
        arr.length = j;
    }
}
export const stringUtil = new class {
    firstUpper(str: string) {
        if (!str)
            return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    firstLower(str: string) {
        if (!str)
            return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
export interface IMetaInfo {
    readonly metaKey: string;
}

export class Meta<T extends IMetaInfo> {
    protected _metaInfos = new Map<string, T>();

    setMeta(metaInfo: T) {
        this._metaInfos.set(metaInfo.metaKey, metaInfo);
    }

    getMeta(key: string) {
        return this._metaInfos.get(key);
    }

    contains(key: string) {
        return !!this._metaInfos.get(key);
    }
}
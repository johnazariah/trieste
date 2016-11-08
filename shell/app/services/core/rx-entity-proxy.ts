import { Type } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

import { DataCache } from "./data-cache";
import { RxProxyBase } from "./rx-proxy-base";

export class RxEntityProxy<TParams, TEntity> extends RxProxyBase<TEntity> {
    public item: Observable<TEntity>;

    private _itemKey = new BehaviorSubject<string>(null);

    private _params: TParams;

    /**
     * @param _type Class for TEntity used to instantiate
     * @param _cache Cache for the model
     * @param _getMethod Method used to retrieve the data. THis should return a Promise
     * @param initialParams This is the initial values of params.
     */
    constructor(
        type: Type<TEntity>,
        cache: DataCache<TEntity>,
        private _getMethod: (params: TParams) => any,
        initialParams: TParams) {

        super(type, cache);
        this._params = initialParams;
        this.item = this._itemKey.map((key) => {
            return this.cache.items.map((items) => {
                return items.get(key);
            });
        }).switch();
    }

    public set params(params: TParams) {
        this._params = params;
        this.markLoadingNewData();
    }

    public get params() {
        return this._params;
    }
    /**
     * Fetch the current i
     */
    public fetch(): Observable<any> {
        return this.fetchData(() => {
            return Observable.fromPromise(this._getMethod(this.params));
        }, (response: any) => {
            const key = this.newItem(response.data);
            this._itemKey.next(key);
        });
    }

    public refresh(): Observable<any> {
        return this.fetch();
    }
}

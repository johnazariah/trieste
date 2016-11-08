import { Type } from "@angular/core";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { DataCache } from "./data-cache";
import { RxProxyBase } from "./rx-proxy-base";

const defaultOptions = {
    maxResults: 50,
};

export class RxListProxy<T> extends RxProxyBase<T> {
    public items: Observable<List<T>>;
    public hasMore: Observable<boolean>;

    private _itemKeys: BehaviorSubject<List<string>> = new BehaviorSubject(List([]));
    private _hasMore: BehaviorSubject<boolean> = new BehaviorSubject(true);
    private _clientProxy: any;

    constructor(type: Type<T>, cache: DataCache<T>, private _proxyConstructor: (options) => any, initalOptions) {
        super(type, cache);
        this._clientProxy = _proxyConstructor(this.computeOptions(initalOptions));
        this._hasMore.next(true);

        this.status = this._status.asObservable();
        this.hasMore = this._hasMore.asObservable();

        this.items = this._itemKeys.map(keys =>
            this.cache.items.map(items =>
                keys.map(key =>
                    items.get(key)))).switch();
    }

    public setOptions(options: {}) {
        this._clientProxy = this._proxyConstructor(this.computeOptions(options));
        this._itemKeys.next(List([]));
        this._hasMore.next(true);

        if (this.queryInProgress()) {
            this.abortFetch();
        }
    }

    public fetchNext(): Observable<any> {
        if (!this._hasMore.getValue()) {
            return Observable.of({ data: [] });
        }

        return this.fetchData(() => {
            this._hasMore.next(this._clientProxy.hasMoreItems());
            return Observable.fromPromise(this._clientProxy.fetchNext());
        }, (response: any) => {
            const keys = this.newItems(response.data);
            this._itemKeys.next(List<string>(this._itemKeys.getValue().concat(keys)));
        });

    }

    private computeOptions(options: any) {
        return Object.assign({}, defaultOptions, options);
    }
}

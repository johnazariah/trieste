import { Type } from "@angular/core";
import { BehaviorSubject, Observable, Subscription } from "rxjs";

import { DataCache } from "./data-cache";
import { LoadingStatus } from "../../components/base/loading/loading.component";

/**
 * Base proxy for List and Entity proxies
 */
export class RxProxyBase<TEntity> {
    /**
     * Status that keep track of any loading
     */
    public status: Observable<LoadingStatus>;

    /**
     * Status that is set to loading only when parameters change
     */
    public newDataStatus: Observable<LoadingStatus>;

    protected _status = new BehaviorSubject<LoadingStatus>(LoadingStatus.Loading);
    protected _newDataStatus = new BehaviorSubject<LoadingStatus>(LoadingStatus.Loading);

    private _currentQuerySub: Subscription = null;
    private _currentObservable: Observable<any>;

    constructor(private type: Type<TEntity>, protected cache: DataCache<TEntity>) {
        this.status = this._status.asObservable();
        this.newDataStatus = this._newDataStatus.asObservable();

        this.status.subscribe((status) => {
            // If we were loading and the last request status change to ready or error
            if (this._newDataStatus.getValue() === LoadingStatus.Loading && status !== LoadingStatus.Loading) {
                this._newDataStatus.next(status);
            }
        });
    }

    /**
     * Create a new item of type TEntity and adds it to the cache
     */
    protected newItem(data: any): string {
        const item = new this.type(data);
        return this.cache.addItem(item);
    }

    /**
     * Create a new item of type TEntity and adds it to the cache
     */
    protected newItems(data: any[]): string[] {
        const items = data.map(x => new this.type(x));
        return this.cache.addItems(items);
    }

    protected fetchData(getData: () => Observable<any>, processResponse: (response: any) => void): Observable<any> {
        if (this._currentQuerySub) {
            return this._currentObservable;
        }
        this._status.next(LoadingStatus.Loading);

        const obs = getData();
        this._currentQuerySub = obs.subscribe((response) => {
            processResponse(response);
            this._status.next(LoadingStatus.Ready);
            this.abortFetch();
        }, (error) => {
            console.error("Error in RxProxy", error);
            this._status.next(LoadingStatus.Error);
            this.abortFetch();
        });
        return obs;
    }

    protected queryInProgress(): boolean {
        return this._currentQuerySub !== null;
    }

    protected abortFetch() {
        this._currentQuerySub.unsubscribe();
        this._currentQuerySub = null;
    }

    /**
     * Call this method when loading new data(e.g. changing the id of the entity need a new entity to be loaded)
     */
    protected markLoadingNewData() {
        this._newDataStatus.next(LoadingStatus.Loading);
    }
}

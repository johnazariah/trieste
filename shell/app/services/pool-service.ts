import { DataCache } from "./core/data-cache";
import { RxEntityProxy } from "./core/rx-entity-proxy";
import { RxListProxy } from "./core/rx-list-proxy";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";

import BatchClient from "../api/batch/batch-client";
import ServiceBase from "./service-base";

import { Pool } from "../../app/models/pool";

export interface PoolParams {
    id?: string;
}

@Injectable()
export class PoolService extends ServiceBase {
    private _basicProperties: string = "id,displayName,state,allocationState";
    private _cache = new DataCache<Pool>();

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public list(options: any = {}): RxListProxy<Pool> {
        return new RxListProxy<Pool>(Pool, this._cache, BatchClient.pool.list, options);
    }

    public get(poolId: string, options: any = {}): RxEntityProxy<PoolParams, Pool> {
        return new RxEntityProxy(Pool, this._cache, (params: PoolParams) => {
            return BatchClient.pool.get(params.id, options);
        }, { id: poolId });
    }

    public delete(poolId: string, options: any): Observable<void> {
        let observable = Observable.fromPromise<any>(
            BatchClient.pool.delete(poolId, options));
        observable.subscribe(
            null,
            (error) => {
                console.error("Error deleting pool: " + poolId, error);
            });

        return observable;
    }
}

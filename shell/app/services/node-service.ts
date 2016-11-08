import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import BatchClient from "../api/batch/batch-client";
import { Node } from "../models";
import { DataCache, RxListProxy } from "./core";
import ServiceBase from "./service-base";

@Injectable()
export class NodeService extends ServiceBase {
    private _basicProperties: string = "id,state,schedulingState,vmSize";
    private _cache = new DataCache<Node>();

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public list(poolId: string, initialOptions: any = {}): RxListProxy<Node> {
        return new RxListProxy<Node>(​​​Node, this._cache, (options) => {
            return BatchClient.node.list(poolId, options);
        }, initialOptions)​;
    }

    public get(poolId: string, nodeId: string, options: any): Observable<Node> {
        let observable = Observable.fromPromise<any>(
            BatchClient.node.get(poolId, nodeId, options)).map((x) => x.data);
        observable.subscribe(
            null,
            (error) => {
                console.error("Error getting nodes for pool: ", poolId, error);
            });

        return observable;
    }
}

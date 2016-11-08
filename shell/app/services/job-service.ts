import { DataCache } from "./core/data-cache";
import { RxEntityProxy } from "./core/rx-entity-proxy";
import { RxListProxy } from "./core/rx-list-proxy";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import BatchClient from "../api/batch/batch-client";
import ServiceBase from "./service-base";

import { Job } from "../../app/models/job";
export interface JobParams {
    id?: string;
}

@Injectable()
export class JobService extends ServiceBase {
    private _basicProperties: string = "id,displayName,state,creationTime,poolInfo";
    private _cache = new DataCache<Job>();

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public list(options: any = {}): RxListProxy<Job> {
        return new RxListProxy<Job>(Job, this._cache, BatchClient.job.list, options);
    }

    public get(jobId: string, options: any = {}): RxEntityProxy<JobParams, Job> {
        return new RxEntityProxy(Job, this._cache, (params: JobParams) => {
            return BatchClient.job.get(params.id, options);
        }, { id: jobId });
    }

    public delete(jobId: string, options: any): Observable<void> {
        return Observable.fromPromise<any>(BatchClient.job.delete(jobId, options));
    }

    public terminate(jobId: string, options: any): Observable<void> {
        return Observable.fromPromise<any>(BatchClient.job.terminate(jobId, options));
    }

    public disable(jobId: string, disableTasks: string, options: any): Observable<void> {
        return Observable.fromPromise<any>(BatchClient.job.disable(jobId, disableTasks, options));
    }

    public enable(jobId: string, options: any): Observable<void> {
        return Observable.fromPromise<any>(BatchClient.job.enable(jobId, options));
    }
}

import { DataCache, RxEntityProxy, RxListProxy } from "./core";
import { Injectable } from "@angular/core";
import { Task } from "../../app/models";

import BatchClient from "../api/batch/batch-client";
import ServiceBase from "./service-base";

export interface TaskParams {
    id?: string;
    jobId?: string;
}

@Injectable()
export class TaskService extends ServiceBase {
    private _basicProperties: string = "id,displayName,state";
    private _cache = new DataCache<Task>();

    public get basicProperties(): string {
        return this._basicProperties;
    }

    public list(jobId: string, initialOptions: any = {}): RxListProxy<Task> {
        return new RxListProxy<Task>(Task, this._cache, (options) => {
            return BatchClient.task.list(jobId, options);
        }, initialOptions);
    }

    public get(jobId: string, taskId: string, options: any = {}): RxEntityProxy<TaskParams, Task> {
        return new RxEntityProxy(Task, this._cache, (params: TaskParams) => {
            return BatchClient.task.get(params.jobId, params.id, options);
        }, { id: taskId, jobId: jobId });
    }
}

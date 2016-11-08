//import * as batch from "azure-batch";

const batch = require("azure-batch");

import JobProxy from "./jobProxy";
import NodeProxy from "./nodeProxy";
import PoolProxy from "./poolProxy";
import TaskProxy from "./taskProxy";

export interface Options {
    account: string;
    key: string;
    url: string;
}

export default class BatchClientProxy {
    private _serviceClient: any;
    private _job: JobProxy;
    private _pool: PoolProxy;
    private _task: TaskProxy;
    private _node: NodeProxy;

    public setOptions(options: Options) {
        const credentials = new batch.SharedKeyCredentials(options.account, options.key);
        this._serviceClient = new batch.ServiceClient(credentials, options.url);

        this._job = new JobProxy(this._serviceClient);
        this._pool = new PoolProxy(this._serviceClient);
        this._task = new TaskProxy(this._serviceClient);
        this._node = new NodeProxy(this._serviceClient);
    }

    get job(): JobProxy {
        return this.checkProxy(this._job);
    }

    get task(): TaskProxy {
        return this.checkProxy(this._task);
    }

    get pool(): PoolProxy {
        return this.checkProxy(this._pool);
    }

    get node(): NodeProxy {
        return this.checkProxy(this._node);
    }

    private checkProxy(proxy: any): any {
        if (!proxy) {
            throw "BatchClientProxy has not been initialized, please call setOptions(options)";
        }

        return proxy;
    }
}
import { BatchRequestOptions } from "./models";
import { DeleteProxy, GetProxy, ListProxy } from "./shared";

export default class JobProxy {
    private _getProxy: GetProxy;
    private _deleteProxy: DeleteProxy;

    constructor(private client: any) {
        this._getProxy = new GetProxy(this.client.job);
        this._deleteProxy = new DeleteProxy(this.client.job);
    }

    public list(options?: BatchRequestOptions) {
        return new ListProxy(this.client.job, null, { jobListOptions: options });
    }

    public get(jobId: string, options?: BatchRequestOptions) {
        return this._getProxy.execute(jobId, { jobGetOptions: options });
    }

    public delete(jobId: string, options?: any) {
        return this._deleteProxy.execute(jobId, { jobDeleteMethodOptions: options });
    }

    public terminate(jobId: string, options?: any) {
        return new Promise((resolve, reject) => {
            this.client.job.terminate(jobId, { jobTerminateOptions: options }, (error, result) => {
                if (error) { return reject(error); }
                return resolve();
            });
        });
    }

    /**
     * Disables the specified job, preventing new tasks from running.
     *
     * @param jobId: The id of the job to disable.
     * @param disableTasks: What to do with active tasks associated with the job.
     *  Possible values include: 'requeue', 'terminate', 'wait'
     * @param options: Optional Parameters.
     */
    public disable(jobId: string, disableTasks: string, options?: any) {
        return new Promise((resolve, reject) => {
            this.client.job.disable(jobId, disableTasks, { jobDisableOptions: options }, (error, result) => {
                if (error) { return reject(error); }
                return resolve();
            });
        });
    }

    public enable(jobId: string, options?: any) {
        return new Promise((resolve, reject) => {
            this.client.job.enable(jobId, { jobEnableOptions: options }, (error, result) => {
                if (error) { return reject(error); }
                return resolve();
            });
        });
    }
}

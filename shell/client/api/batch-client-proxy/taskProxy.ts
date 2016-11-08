import { BatchRequestOptions } from "./models";
import { ListProxy }  from "./shared";

export default class TaskProxy {
    constructor(private client: any) {
    }

    public list(jobId: string, options?: BatchRequestOptions) {
        return new ListProxy(this.client.task, [jobId], { taskListOptions: options });
    }
}

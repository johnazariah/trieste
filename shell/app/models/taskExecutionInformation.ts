import SchedulingError from "./SchedulingError";

/**
 * Contains information about the execution of a task in the Azure
 */
export default class TaskExecutionInformation {
    public startTime: Date;
    public endTime: Date;
    public exitCode: number;
    public schedulingError: SchedulingError;
    public retryCount: number;
    public lastRetryTime: Date;
    public requeueCount: number;
    public lastRequeueTime: Date;
}

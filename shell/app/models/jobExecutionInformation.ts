import SchedulingError from "./SchedulingError";

/**
 * Contains information about the execution of a job in the Azure
 */
export default class JobExecutionInformation {
    public startTime: Date;
    public endTime: Date;
    public poolId: string;
    public schedulingError: SchedulingError;
    public terminateReason: string;
}

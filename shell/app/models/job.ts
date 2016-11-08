import JobConstraints from "./JobConstraints";
import JobExecutionInformation from "./jobExecutionInformation";

import { JobState } from "./";
import { NameValuePair } from "./nameValuePair";
import { Record } from "immutable";

// tslint:disable:variable-name
const JobRecord = Record({
    id: null,
    displayName: null,
    usesTaskDependencies: false,
    url: null,
    eTag: null,
    lastModified: null,
    creationTime: null,
    state: null,
    stateTransitionTime: null,
    previousState: null,
    previousStateTransitionTime: null,
    priority: null,
    onAllTasksComplete: null,
    onTaskFailure: null,
    constraints: null,
    jobManagerTask: null,
    jobPreparationTask: null,
    jobReleaseTask: null,
    commonEnvironmentSettings: null,
    poolInfo: null,
    metadata: null,
    executionInfo: null,
    stats: null,
});

/**
 * Class for displaying Batch job information.
 */
export class Job extends JobRecord {
    public id: string;
    public displayName: string;
    public usesTaskDependencies: boolean;
    public url: string;
    public eTag: string;
    public lastModified: Date;
    public creationTime: Date;
    public state: JobState;
    public stateTransitionTime: Date;
    public previousState: JobState;
    public previousStateTransitionTime: Date;
    public priority: number;
    public onAllTasksComplete: string;
    public onTaskFailure: string;

    public constraints: JobConstraints;
    public jobManagerTask: any;
    public jobPreparationTask: any;
    public jobReleaseTask: any;
    public commonEnvironmentSettings: NameValuePair[];
    public poolInfo: any;
    public metadata: NameValuePair[];
    public executionInfo: JobExecutionInformation;
    public stats: JobStats;
}

export class JobStats {
    public numSucceededTasks: number;
    public numFailedTasks: number;
    public numTaskRetries: number;
    public waitTime: Date;
}

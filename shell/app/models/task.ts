import TaskExecutionInformation from "./taskExecutionInformation";

import { Record } from "immutable";

// tslint:disable:variable-name
const TaskRecord = Record({
    id: null,
    displayName: null,
    url: null,
    eTag: null,
    lastModified: null,
    creationTime: null,
    state: null,
    stateTransitionTime: null,
    previousState: null,
    previousStateTransitionTime: null,
    commandLine: null,
    runElevated: null,
    exitConditions: null,
    resourceFiles: null,
    environmentSettings: null,
    affinityInfo: null,
    constraints: null,
    executionInfo: null,
    nodeInfo: null,
    multiInstanceSettings: null,
    stats: null,
    dependsOn: null,
    applicationPackageReferences: null,
});

/**
 * Class for displaying Batch task information.
 */
export class Task extends TaskRecord {
    public id: string;
    public displayName: string;
    public url: string;
    public eTag: string;
    public lastModified: Date;
    public creationTime: Date;
    public state: TaskState;
    public stateTransitionTime: Date;
    public previousState: TaskState;
    public previousStateTransitionTime: Date;
    public commandLine: string;
    public runElevated: boolean;

    public exitConditions: any;                 // ExitConditions
    public resourceFiles: any[];                // ResourceFile
    public environmentSettings: any[];          // EnvironmentSetting
    public affinityInfo: any;                   // AffinityInformation
    public constraints: any;                    // TaskConstraints
    public executionInfo: TaskExecutionInformation;
    public nodeInfo: any;                       // ComputeNodeInformation
    public multiInstanceSettings: any;          // MultiInstanceSettings
    public stats: any;                          // TaskStatistics
    public dependsOn: any;                      // TaskDependencies
    public applicationPackageReferences: any[]; // ApplicationPackageReference
}

export type TaskState = "active" | "preparing " | "running" | "completed";
export const TaskState = {
    active: "active" as TaskState,
    preparing: "preparing " as TaskState,
    running: "running" as TaskState,
    completed: "completed" as TaskState,
};


import { Record } from "immutable";

// tslint:disable:variable-name object-literal-sort-keys
const NodeRecord = Record({
    id: null,
    state: null,
    totalTasksRun: 0,
    schedulingState: null,
    vmSize: null,
});

/**
 * Class for displaying Batch node information.
 */
export class Node extends NodeRecord {
    public id: string;
    public state: string;
    public totalTasksRun: number;
    public schedulingState: string;
    public vmSize: string;
}

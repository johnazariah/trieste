import { DecoratorBase } from "../../utils/decorators";
import { JobConstraintsDecorator } from "./job-constraints-decorator";
import { JobExecutionInfoDecorator } from "./job-execution-info-decorator";
import { Job, JobState } from "../../../app/models";

export class JobDecorator extends DecoratorBase<Job> {
    public state: string;
    public stateTransitionTime: string;
    public stateIcon: string;
    public displayName: string;
    public creationTime: string;
    public lastModified: string;
    public previousState: string;
    public previousStateTransitionTime: string;
    public priority: string;
    public usesTaskDependencies: boolean;
    public onAllTasksComplete: string;
    public onTaskFailure: string;

    public constraints: JobConstraintsDecorator;
    public executionInfo: JobExecutionInfoDecorator;
    public jobManagerTask: {};
    public jobPreparationTask: {};
    public jobReleaseTask: {};
    public poolInfo: {};

    constructor(private job?: Job) {
        super(job);

        this.state = this.stateField(job.state);
        this.stateTransitionTime = this.dateField(job.stateTransitionTime);
        this.stateIcon = this._getStateIcon(job.state);
        this.creationTime = this.dateField(job.creationTime);
        this.lastModified = this.dateField(job.lastModified);
        this.displayName = this.stringField(job.displayName);
        this.previousState = this.stateField(job.previousState);
        this.previousStateTransitionTime = this.dateField(job.previousStateTransitionTime);
        this.priority = job.priority.toString();
        this.usesTaskDependencies = job.usesTaskDependencies;
        this.onAllTasksComplete = this._translateAutoComplete(job.onAllTasksComplete);
        this.onTaskFailure = this._translateAutoComplete(job.onTaskFailure);

        this.constraints = new JobConstraintsDecorator(job.constraints || <any>{});
        this.executionInfo = new JobExecutionInfoDecorator(job.executionInfo || <any>{});
        this.jobManagerTask = job.jobManagerTask || {};
        this.jobPreparationTask = job.jobPreparationTask || {};
        this.jobReleaseTask = job.jobReleaseTask || {};
        this.poolInfo = job.poolInfo || {};
    }

    // TODO: need to map the Job model so that a state is actually an enum as currently
    // it's a string because the API returns a string, and because javascript.
    private _getStateIcon(state: JobState): string {
        switch (state.toString()) {
            case "active":
                return "fa-cog";
            case "completed":
                return "fa-check-circle-o";
            case "deleting":
            case "disabling":
            case "disabled":
            case "terminating":
                return "fa-ban";

            default:
                return "fa-question-circle-o";
        }
    }

    // todo: can be moved into a common method when we localize
    private _translateAutoComplete(state: string): string {
        switch (state) {
            case "noaction":
                return "NoAction";
            case "performexitoptionsjobaction":
                return "PerformExitOptionsJobAction";
            case "terminatejob":
                return "TerminateJob";

            default:
                return state;
        }
    }
}

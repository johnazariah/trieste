import { Component, Input, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
//import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { LoadingStatus } from "../../../../app/components/base/loading";
import { Task, TaskState } from "../../../../app/models";
import { SchedulingErrorDecorator } from "../../../../app/models/decorators";
import { TaskService } from "../../../../app/services";
import { RxListProxy } from "../../../../app/services/core";

@Component({
    selector: "bex-task-list",
    template: require("./task-list.html"),
})

export class TaskListComponent implements OnInit {
    /**
     * If set to true it will display the quick list view, if false will use the table view
     */
    @Input()
    public quickList: boolean;

    @Input()
    public set jobId(value: string) {
        this._jobId = (value && value.trim());
        this.refresh();
    }
    public get jobId() { return this._jobId; }

    public data: RxListProxy<Task>;
    public status: Observable<LoadingStatus>;
    public searchQuery = new FormControl();

    private _jobId: string;
    private _baseOptions = { maxResults: 25 };

    constructor(private taskService: TaskService) {
        this.searchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
            if (query === "") {
                this.data.setOptions(this._baseOptions);
            } else {
                const filter = `startswith(id, '${query}')`;
                this.data.setOptions(Object.assign({}, this._baseOptions, { filter }));
            }

            this.data.fetchNext();
        });
    }

    public ngOnInit() {
        return;
    }

    //@autobind()
    public refresh(): Observable<any> {
        this.data = this.taskService.list(this._jobId, this._baseOptions);
        this.data.setOptions(Object.assign({}, this._baseOptions));
        this.status = this.data.status;

        return this.data.fetchNext();
    }

    public hasWarning(task: Task): boolean {
        return (task.state === TaskState.completed && task.executionInfo.exitCode !== 0);
    }

    public warningText(task: Task): string {
        return (task.executionInfo && task.executionInfo.schedulingError)
            ? new SchedulingErrorDecorator(task.executionInfo.schedulingError).summary
            : this.hasWarning(task) ? "Task failed with exitCode: " + task.executionInfo.exitCode : "";
    }

    public loadMore() {
        // might need a manual one of these here rather than an auto scroll
    }
}

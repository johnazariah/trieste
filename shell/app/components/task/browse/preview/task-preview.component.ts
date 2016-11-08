import { Component, Input } from "@angular/core";
import * as moment from "moment";

import { Task, TaskState } from "../../../../../app/models";

@Component({
    selector: "bex-task-preview",
    template: require("./task-preview.html"),
})
export class TaskPreviewComponent {
    public taskStates = TaskState;

    @Input()
    public task: Task;

    public elapsedTime = "";

    public get exitCode() {
        const code = this.task.executionInfo.exitCode;
        return code === undefined ? "?" : code;
    }

    public get startTime() {
        return this.task.executionInfo.startTime;
    }
}

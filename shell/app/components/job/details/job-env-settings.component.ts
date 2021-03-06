import { Component, Input, OnDestroy, ViewContainerRef } from "@angular/core";
import { Job, NameValuePair } from "../../../../app/models";

@Component({
    selector: "bex-job-environment-settings",
    template: require("./job-env-settings.html"),
})

export class JobEnvironmentSettingsComponent implements OnDestroy {
    @Input()
    public set job(job: Job) {
        this._job = job;
        this.refresh(job);
    }
    public get job() { return this._job; }
    public environmentSettings: NameValuePair[] = [];

    private _job: Job;

    constructor(
        private viewContainerRef: ViewContainerRef) {
    }

    public refresh(job: Job) {
        if (this.job) {
            this.environmentSettings = this.job.commonEnvironmentSettings || [];
        }
    }

    public ngOnDestroy() {
        /* tab hide */
    }
}

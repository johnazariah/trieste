import { Component, OnDestroy, OnInit, ViewContainerRef } from "@angular/core";
import { MdDialog, MdDialogConfig } from "@angular/material";
import { ActivatedRoute } from "@angular/router";
//import { autobind } from "core-decorators";
import { Subscription } from "rxjs/Subscription";

import { DeleteJobDialogComponent } from "../action/delete/delete-job-dialog.component";
import { DisableJobDialogComponent } from "../action/disable/disable-job-dialog.component";
import { TerminateJobDialogComponent } from "../action/terminate/terminate-job-dialog.component";
import { Job } from "../../../../app/models";
import { JobDecorator } from "../../../../app/models/decorators";
import { JobParams, JobService } from "../../../../app/services";
import { RxEntityProxy } from "../../../../app/services/core";

@Component({
    selector: "bex-job-details",
    template: require("./job-details.html"),
})

export class JobDetailsComponent implements OnInit, OnDestroy {
    public job: Job;
    public decorator: JobDecorator;
    public data: RxEntityProxy<JobParams, Job>;

    private _paramsSubscriber: Subscription;

    constructor(
        private dialog: MdDialog,
        private activatedRoute: ActivatedRoute,
        private viewContainerRef: ViewContainerRef,
        private jobService: JobService) {

        this.data = this.jobService.get(null, {});
        this.data.item.subscribe((job) => {
            if (job) {
                this.decorator = new JobDecorator(job);
                this.job = job;
            }
        });
    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe((params) => {
            this.data.params = { id: params["id"] };
            this.data.fetch();
        });
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
    }

    //@autobind()
    public refresh() {
        return this.data.refresh();
    }

    public addJob() {
        /* add job here */
    }

    public terminateJob() {
        /* terminate job here, disable button if completed */
        let config = new MdDialogConfig();
        config.viewContainerRef = this.viewContainerRef;

        const dialogRef = this.dialog.open(TerminateJobDialogComponent, config);
        dialogRef.componentInstance.jobId = this.job.id;
        dialogRef.afterClosed().subscribe((obj) => {
            this.refresh();
        });
    }

    public deleteJob() {
        let config = new MdDialogConfig();
        config.viewContainerRef = this.viewContainerRef;

        const dialogRef = this.dialog.open(DeleteJobDialogComponent, config);
        dialogRef.componentInstance.jobId = this.job.id;
        dialogRef.afterClosed().subscribe((obj) => {
            // todo: clear current selection, show notification
            // maybe just redirect back to jobs home.
            this.refresh();
        });
    }

    public disableJob() {
        /* disable job here, disable button if completed or disabled */
        let config = new MdDialogConfig();
        config.viewContainerRef = this.viewContainerRef;

        const dialogRef = this.dialog.open(DisableJobDialogComponent, config);
        dialogRef.componentInstance.jobId = this.job.id;
        dialogRef.afterClosed().subscribe((obj) => {
            this.refresh();
        });
    }
}

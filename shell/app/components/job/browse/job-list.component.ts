import { Component, Input, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
//import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { LoadingStatus } from "../../../../app/components/base/loading";
import { Job } from "../../../../app/models";
import { SchedulingErrorDecorator } from "../../../../app/models/decorators";
import { JobService } from "../../../../app/services";
import { RxListProxy } from "../../../../app/services/core";
import { Filter } from "../../../../app/utils/filter-builder";

@Component({
    selector: "bex-job-list",
    template: require("./job-list.html"),
})
export class JobListComponent implements OnInit {
    public status: Observable<LoadingStatus>;
    public data: RxListProxy<Job>;
    public searchQuery = new FormControl();

    @Input()
    public set filter(filter: Filter) {
        this._filter = filter;

        if (filter.isEmpty()) {
            this.data.setOptions({});
        } else {
            this.data.setOptions({ filter: filter.toOData() });
        }

        this.data.fetchNext();
    }
    public get filter(): Filter { return this._filter; };

    private _filter: Filter;

    // todo: ask tim about setting difference select options for list and details.
    private _baseOptions = {};

    constructor(private router: Router, private jobService: JobService) {
        this.data = this.jobService.list(this._baseOptions);
        this.status = this.data.status;
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    //@autobind()
    public refresh(): Observable<any> {
        this.data.setOptions({});
        return this.data.fetchNext();
    }

    public hasWarning(job: Job): boolean {
        return !!(job.executionInfo && job.executionInfo.schedulingError);
    }

    public warningText(job: Job): string {
        return (job.executionInfo && job.executionInfo.schedulingError)
            ? new SchedulingErrorDecorator(job.executionInfo.schedulingError).summary
            : "";
    }

    public onScrollToBottom(x) {
        this.data.fetchNext();
    }
}

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
//import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { LoadingStatus } from "../../../../app/components/base/loading";
import { SelectableList } from "../../../../app/components/base/selectable-list";
import { Pool } from "../../../../app/models";
import { PoolService } from "../../../../app/services";
import { RxListProxy } from "../../../../app/services/core";
import { Filter } from "../../../../app/utils/filter-builder";

@Component({
    selector: "bex-pool-list",
    templateUrl: "./pool-list.html",
})
export class PoolListComponent extends SelectableList implements OnInit {
    public status: Observable<LoadingStatus>;
    public data: RxListProxy<Pool>;

    // Inheritance bugs https://github.com/angular/angular/issues/5415
    @Output()
    public itemSelected: EventEmitter<any>;

    @Input()
    public quickList: boolean;

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

    constructor(private poolService: PoolService, activatedRoute: ActivatedRoute, router: Router) {
        super(router, activatedRoute, "id");
        this.data = this.poolService.list();
        this.status = this.data.status;
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    //@autobind()
    public refreshPools(): Observable<any> {
        this.data.setOptions({});
        return this.data.fetchNext();
    }

    public hasPoolWarning(pool: Pool): boolean {
        return !!pool.resizeError;
    }

    public poolWarningText(pool: Pool): string {
        if (pool.resizeError) {
            return "Pool has a resize error";
        }

        return "";
    }

    public onScrollToBottom(x) {
        this.data.fetchNext();
    }
}

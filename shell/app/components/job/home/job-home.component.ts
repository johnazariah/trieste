import { Component } from "@angular/core";
import { FormBuilder, FormControl } from "@angular/forms";

import * as FilterBuilder from "../../../../app/utils/filter-builder";
import Filter = FilterBuilder.Filter;

@Component({
    selector: "bex-job-home",
    template: require("./job-home.html"),
})
export class JobHomeComponent {
    public quickSearchQuery = new FormControl();

    public filter: Filter = FilterBuilder.none();
    public quickFilter: Filter = FilterBuilder.none();
    public advancedFilter: Filter = FilterBuilder.none();

    public showAdvancedFilter = true;

    constructor(private formBuilder: FormBuilder) {
        this.quickSearchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
            if (query === "") {
                this.quickFilter = FilterBuilder.none();
            } else {
                this.quickFilter = FilterBuilder.prop("id").startswith(query);
            }
            this._updateFilter();
        });
    }

    public toggleFilter() {
        this.showAdvancedFilter = !this.showAdvancedFilter;
    }

    public addJob() {
        /* add job here */
    }

    public advancedFilterChanged(filter: Filter) {
        this.advancedFilter = filter;
        this._updateFilter();
    }

    private _updateFilter() {
        this.filter = FilterBuilder.and(this.quickFilter, this.advancedFilter);
    }
}

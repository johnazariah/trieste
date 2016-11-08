import { Component } from "@angular/core";
import {
    FormBuilder,
    FormControl,
} from "@angular/forms";

import { ListAndShowLayoutComponent } from "../../../../app/components/base/list-and-show-layout";
import * as FilterBuilder from "../../../../app/utils/filter-builder";
import Filter = FilterBuilder.Filter;
@Component({
    selector: "bex-pool-home",
    template: require("./pool-home.html"),
})
export class PoolHomeComponent {
    public quickSearchQuery = new FormControl();

    public filter: Filter = FilterBuilder.none();
    public quickFilter: Filter = FilterBuilder.none();
    public advancedFilter: Filter = FilterBuilder.none();

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

    public advancedFilterChanged(filter: Filter) {
        this.advancedFilter = filter;
        this._updateFilter();
    }

    private _updateFilter() {
        this.filter = FilterBuilder.and(this.quickFilter, this.advancedFilter);
    }
}

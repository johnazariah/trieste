import { Component } from "@angular/core";
import { FormBuilder, FormControl } from "@angular/forms";

import { SidebarManager } from "../../base/sidebar";
import AccountCreateDialogComponent from "../add/create-dialog";
import * as FilterBuilder from "../../../../app/utils/filter-builder";

@Component({
    selector: "bex-account-home",
    template: require("./account-home.html"),
})
export class AccountHomeComponent {
    public quickSearchQuery = new FormControl();
    public filter = FilterBuilder.none();

    constructor(private formBuilder: FormBuilder, private sidebarManager: SidebarManager) {
        this.quickSearchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
            if (query === "") {
                this.filter = FilterBuilder.none();
            } else {
                this.filter = FilterBuilder.prop("id").startswith(query);
            }
        });
    }

    public addAccount() {
        this.sidebarManager.open("add-account", AccountCreateDialogComponent);
    }

}

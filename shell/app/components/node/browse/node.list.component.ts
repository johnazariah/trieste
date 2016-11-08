import { Component, Input, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { NodeService } from "../../../../app/services";
import { RxListProxy } from "../../../../app/services/core";
//import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { LoadingStatus } from "../../../../app/components/base/loading";
import { Node } from "../../../../app/models";

@Component({
    selector: "bex-node-list",
    template: require("./node-list.html"),
})
export class NodeListComponent implements OnInit {
    /**
     * If set to true it will display the quick list view, if false will use the table view
     */
    @Input()
    public quickList: boolean;

    @Input()
    public set poolId(value: string) {
        this._poolId = (value && value.trim());
        this.refreshNodes();
    }
    public get poolId() { return this._poolId; }

    public status: Observable<LoadingStatus>;
    public data: RxListProxy<Node>;
    public searchQuery = new FormControl();

    private _poolId: string;

    constructor(private nodeService: NodeService) {
        this.searchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
            if (query === "") {
                this.data.setOptions({});
            } else {
                const filter = `startswith(id, '${query}')`;
                this.data.setOptions({ filter });
            }
            this.data.fetchNext();
        });
    }

    public ngOnInit() {
        return;
    }

    //@autobind()
    public refreshNodes(): Observable<any> {
        this.data = this.nodeService.list(this.poolId);
        this.status = this.data.status;
        this.data.setOptions({}); // This clears the previous list objects
        return this.data.fetchNext();
    }

    public isErrorState(node: any) {
        if (node.state === "startTaskFailed") {
            return true;
        }
        return false;
    }
}

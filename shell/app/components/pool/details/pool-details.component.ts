import { Component, OnDestroy, OnInit, ViewContainerRef } from "@angular/core";
import { MdDialog, MdDialogConfig } from "@angular/material";
import { ActivatedRoute } from "@angular/router";
//import { autobind } from "core-decorators";
import * as Moment from "moment";
import { Subscription } from "rxjs";

import { DeletePoolDialogComponent } from "../action/delete/delete-pool-dialog.component";
import { Pool } from "../../../../app/models"
import { PoolParams, PoolService } from "../../../../app/services";
import { RxEntityProxy } from "../../../../app/services/core";

@Component({
    selector: "bex-pool-details",
    template: require("./pool-details.html"),
})
export class PoolDetailsComponent implements OnInit, OnDestroy {
    public poolId: string;
    public pool: Pool;
    public data: RxEntityProxy<PoolParams, Pool>;

    private _paramsSubscriber: Subscription;

    constructor(
        private activatedRoute: ActivatedRoute,
        private dialog: MdDialog,
        private viewContainerRef: ViewContainerRef,
        private poolService: PoolService) {

        this.data = this.poolService.get(null, {});
        this.data.item.subscribe((pool) => {
            this.pool = pool;
        });
    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe((params) => {
            this.poolId = params["id"];
            this.data.params = { id: this.poolId };
            this.data.fetch();
        });
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
    }

    //@autobind()
    public refreshPool() {
        return this.data.refresh();
    }

    public deletePool() {
        let config = new MdDialogConfig();
        config.viewContainerRef = this.viewContainerRef;

        const dialogRef = this.dialog.open(DeletePoolDialogComponent, config);
        dialogRef.componentInstance.poolId = this.poolId;
        dialogRef.afterClosed().subscribe((obj) => {
            this.refreshPool();
        });
    }

    // TODO: Move all of these to pool decorator
    public get poolOs(): string {
        if (this.pool.cloudServiceConfiguration) {
            let osName: string;
            let osFamily = this.pool.cloudServiceConfiguration.osFamily;

            if (osFamily === "2") {
                osName = "Windows Server 2008 R2 SP1";
            } else if (osFamily === "3") {
                osName = "Windows Server 2012";
            } else {
                osName = "Windows Server 2012 R2";
            }

            return osName;
        }

        if (this.pool.virtualMachineConfiguration.imageReference.publisher ===
            "MicrosoftWindowsServer") {
            let osName = "Windows Server";
            osName += this.pool.virtualMachineConfiguration.imageReference.sku;

            return osName;
        }

        return "Linux";
    }

    public get poolOsIcon(): string {
        if (this.poolOs.includes("Windows")) {
            return "windows";
        }

        return "linux";
    }

    public get lastResize(): string {
        return Moment(this.pool.allocationStateTransitionTime).fromNow();
    }
}

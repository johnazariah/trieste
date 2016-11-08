import { PoolService } from "../../../../services";
import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";

@Component({
    selector: "bex-delete-pool-dialog",
    template: require("./delete-pool-dialog.html"),
})

export class DeletePoolDialogComponent {
    public poolId: string;

    constructor(
        public dialogRef: MdDialogRef<DeletePoolDialogComponent>,
        private poolService: PoolService) {
    }

    public destroyPool() {
        let options: any = {};
        let observable = this.poolService.delete(this.poolId, options);
        observable.subscribe(
            (val) => null,
            (error) => { console.error("destroyPool() :: error: ", error); },
            () => {
                this.dialogRef.close();
            } // todo: clear current selection, show notification
        );

        return observable;
    }
}

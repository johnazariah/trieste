import { AccountService } from "../../../services";
import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";

@Component({
    selector: "bex-delete-account-dialog",
    template: require("./delete-account-dialog.html"),
})

export class DeleteAccountDialogComponent {
    public accountName: string;

    constructor(
        public dialogRef: MdDialogRef<DeleteAccountDialogComponent>,
        private accountService: AccountService) {
    }

    public destroyAccount() {
        this.accountService.delete(this.accountName).subscribe(
            (val) => { },
            (error) => { console.error("destroyAccount() :: error: ", error) },
            () => { this.dialogRef.close() } // todo: clear current selection, show notification
        );
    }
}

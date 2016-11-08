import { JobService } from "../../../../services";
import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";

@Component({
    selector: "bex-delete-job-dialog",
    template: require("./delete-job-dialog.html"),
})

export class DeleteJobDialogComponent {
    public jobId: string;
    public processing: boolean = false;

    private _hasError: boolean = false;
    private _errorText: string;

    constructor(
        public dialogRef: MdDialogRef<DeleteJobDialogComponent>,
        private jobService: JobService) {
    }

    public ok() {
        let options: any = {};
        this.processing = true;

        this.jobService.delete(this.jobId, options).subscribe(
            null,
            (error) => {
                const errJson = JSON.stringify(error);
                console.error("error deleting job: ", errJson);

                this._hasError = true;
                this.processing = false;
                this._errorText = error.message && error.message.value
                    ? error.message.value.replace("\n", " ")
                    : "unknown error occurred while deleting the job";
            },
            () => {
                this.processing = false;
                this.dialogRef.close();
            }
        );
    }

    public hasError(): boolean {
        return this._hasError;
    }

    public errorText(): string {
        return this._errorText;
    }
}

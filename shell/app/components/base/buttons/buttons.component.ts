import { Component } from "@angular/core";

/**
 * Would be nice to be able to have an abstract base component that held the 
 * button template and we just called super("Add", "fa-icon"). 
 */

@Component({
    selector: "bex-add-button",
    template: `<button md-button><i class="fa fa-plus"></i> Add</button>`,
})
export class AddButtonComponent {
}

@Component({
    selector: "bex-terminate-button",
    template: `<button md-button><i class="fa fa-times"></i> Terminate</button>`,
})
export class TerminateButtonComponent {
}

@Component({
    selector: "bex-delete-button",
    template: `<button md-button><i class="fa fa-trash-o"></i> Delete</button>`,
})
export class DeleteButtonComponent {
}

@Component({
    selector: "bex-disable-button",
    template: `<button md-button><i class="fa fa-pause"></i> Disable</button>`,
})
export class DisableButtonComponent {
}


import { Component, Input } from "@angular/core";

@Component({
    selector: "bex-quick-list",
    template: "<ng-content></ng-content>",
})
export class QuickListComponent {

}

@Component({
    selector: "bex-quick-list-item",
    template: require("./quick-list-item.html"),
})
export class QuickListItemComponent {
}

export enum ListItemStatus {
    Steady,
    Warning,
}

@Component({
    selector: "bex-quick-list-item-status",
    template: `
        <div [class.warning]="warning" *ngIf="tooltip" md-tooltip="{{tooltip}}" tooltip-position="below"></div>
        <div [class.warning]="warning" *ngIf="!tooltip"></div>
    `,
})
export class QuickListItemStatusComponent {

    @Input()
    public tooltip: string;

    @Input()
    public warning: boolean;
}

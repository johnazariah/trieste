import { Component } from "@angular/core";

@Component({
    selector: "bex-table",
    templateUrl: `<ng-content></ng-content>`,
})
export class TableComponent {
    constructor() { }
}

@Component({
    selector: "bex-thead",
    templateUrl: `<tr><ng-content></ng-content></tr>`,
})
export class TableHeadComponent {
    constructor() { }
}

@Component({
    selector: "bex-column",
    templateUrl: `<ng-content></ng-content>`,
})
export class TableColumnComponent {
    constructor() { }
}

@Component({
    selector: "bex-tbody",
    templateUrl: `<ng-content></ng-content>`,
})
export class TableBodyComponent {
    constructor() { }
}

@Component({
    selector: "bex-row",
    templateUrl: `<ng-content></ng-content>`,
})
export class TableRowComponent {
    constructor() { }
}

@Component({
    selector: "bex-cell",
    templateUrl: `<ng-content></ng-content>`,
})
export class TableCellComponent {
    constructor() { }
}

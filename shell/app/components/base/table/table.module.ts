import { ModuleWithProviders, NgModule } from "@angular/core";

import {
    TableBodyComponent,
    TableCellComponent,
    TableColumnComponent,
    TableComponent,
    TableHeadComponent,
    TableRowComponent,
} from "./table.component";

const components = [
    TableBodyComponent,
    TableCellComponent,
    TableColumnComponent,
    TableComponent,
    TableHeadComponent,
    TableRowComponent,
]
@NgModule({
    imports: [],
    exports: components,
    declarations: components,
    providers: [],
})
export class TableModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: TableModule,
            providers: [],
        };
    }
}

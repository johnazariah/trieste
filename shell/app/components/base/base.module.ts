import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

// components
import { routes } from "../../app.routes";
import { AdvancedFilterModule } from "./advanced-filter";
import { ButtonsModule } from "./buttons";
import { DropdownModule } from "./dropdown";
import { ElapsedTimeComponent } from "./elapsed-time";
import { ListAndShowLayoutComponent } from "./list-and-show-layout";
import { LoadingComponent } from "./loading";
import { PropertyListModule } from "./property-list";
import { QuickListComponent, QuickListItemComponent, QuickListItemStatusComponent } from "./quick-list";
import { RefreshButtonComponent } from "./refresh-btn";
import { ScrollableComponent } from "./scrollable";
import { SidebarModule } from "./sidebar";
import { TableModule } from "./table";

// Add submodules there
const modules = [
    AdvancedFilterModule,
    ButtonsModule,
    DropdownModule,
    PropertyListModule,
    SidebarModule,
    TableModule,
];

// Add subcomponnent not in a module here
const components = [
    ElapsedTimeComponent,
    ListAndShowLayoutComponent,
    QuickListComponent,
    QuickListItemComponent,
    QuickListItemStatusComponent,
    LoadingComponent,
    ScrollableComponent,
    RefreshButtonComponent,
];

@NgModule({
    declarations: components,
    entryComponents: [
    ],
    exports: [...modules, ...components],
    imports: [
        BrowserModule,
        FormsModule,
        MaterialModule.forRoot(),
        ReactiveFormsModule,
        RouterModule.forRoot(routes, { useHash: true }),
        ...modules.map(x => x.forRoot()),
    ],
    providers: [
    ],
})
export class BaseModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: BaseModule,
            providers: [],
        };
    }
}

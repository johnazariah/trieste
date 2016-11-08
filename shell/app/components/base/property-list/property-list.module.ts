import { ModuleWithProviders, NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { routes } from "../../../app.routes";

import {
    BoolPropertyComponent,
    LinkPropertyComponent,
    PropertyGroupComponent,
    PropertyListComponent,
    TextPropertyComponent,
    VoidLinkPropertyComponent,
} from "./property-list.component";

const components = [
    BoolPropertyComponent,
    LinkPropertyComponent,
    PropertyListComponent,
    PropertyGroupComponent,
    TextPropertyComponent,
    VoidLinkPropertyComponent,
];

@NgModule({
    declarations: components,
    entryComponents: [],
    exports: [ ...components ],
    imports: [ RouterModule.forRoot(routes, { useHash: true }) ],
    providers: [],
})

export class PropertyListModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: PropertyListModule,
            providers: [],
        };
    }
}

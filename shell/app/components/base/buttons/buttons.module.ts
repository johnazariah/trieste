import { ModuleWithProviders, NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { routes } from "../../../app.routes";

import {
    AddButtonComponent,
    DeleteButtonComponent,
    DisableButtonComponent,
    TerminateButtonComponent,
} from "./buttons.component";

const components = [
    AddButtonComponent,
    DeleteButtonComponent,
    DisableButtonComponent,
    TerminateButtonComponent,
];

@NgModule({
    declarations: components,
    entryComponents: [],
    exports: [ ...components ],
    imports: [ RouterModule.forRoot(routes, { useHash: true }) ],
    providers: [],
})

export class ButtonsModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: ButtonsModule,
            providers: [],
        };
    }
}

import { Component, Input } from "@angular/core";

@Component({
    selector: "bex-property-list",
    template: `
        <fieldset>
            <ng-content></ng-content>
        </fieldset>
    `,
})
export class PropertyListComponent {
}

@Component({
    selector: "bex-property-group",
    template: `
        <legend><h4>{{label}}</h4></legend>
        <ng-content></ng-content>
    `,
})
export class PropertyGroupComponent {
    @Input()
    public label: string;
}

@Component({
    selector: "bex-text-property",
    template: `
        <section>
            <label>{{label}}</label>
            <p>{{value}}</p>
        </section>
    `,
})
export class TextPropertyComponent {
    @Input()
    public label: string;

    @Input()
    public value: string;
}

@Component({
    selector: "bex-link-property",
    template: `
        <section>
            <label>{{label}}</label>
            <p><a [routerLink]="link">{{value}}</a></p>
        </section>
    `,
})
export class LinkPropertyComponent {
    @Input()
    public label: string;

    @Input()
    public value: string;

    @Input()
    public link: string;
}

// todo: only for testing, delete when we have task navigation working.
@Component({
    selector: "bex-void-link-property",
    template: `
        <section>
            <label>{{label}}</label>
            <p><a href="javascript:void(0);">{{value}}</a></p>
        </section>
    `,
})
export class VoidLinkPropertyComponent {
    @Input()
    public label: string;

    @Input()
    public value: string;
}

@Component({
    selector: "bex-bool-property",
    template: `
        <section>
            <label>{{label}}</label>
            <p><i class="fa" [class.fa-check-circle]="value" [class.fa-times-circle]="!value"></i> 
                {{value ? "Enabled" : "Disabled"}}
            </p>
        </section>
    `,
})
export class BoolPropertyComponent {
    @Input()
    public label: string;

    @Input()
    public value: boolean;
}

import { Component, HostBinding, animate, style, transition, trigger } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Component({
    selector: "bex-list-and-show-layout",
    template: require("./list-and-show-layout.html"),
    animations: [
        trigger("slideIn", [
            transition("void => *", [
                style({ transform: "translateX(-100%)" }),
                animate(250, style({ transform: "translateX(0)" })),
            ]),
            transition("* => void", [
                style({ transform: "translateX(0)" }),
                animate(250, style({ transform: "translateX(-100%)" })),
            ]),
        ]),
    ]
})
export class ListAndShowLayoutComponent {
    public showAdvancedFilter = new BehaviorSubject<boolean>(false);

    public toggleFilter(value?: boolean) {
        this.showAdvancedFilter.next(value == null ? !this.showAdvancedFilter.getValue() : value);
    }

    public itemSelected(item: any) {
        // Triggered twice everytime TODO check
        if (item) {
            this.toggleFilter(false);
        } else {
            // this.toggleFilter(true);
        }
    }
}

import {
    Component,
    Input,
    Optional,
    SkipSelf,
    animate,
    state,
    style,
    transition,
    trigger,
} from "@angular/core";
import { BehaviorSubject } from "rxjs";

export enum LoadingStatus {
    Loading = 1,
    Ready = 2,
    Error = 3,
}

export enum DisplayStatus {
    Loading = 1,
    Ready = 2,
    Error = 3,
    ParentLoading = 4,
}

@Component({
    selector: "bex-loading",
    templateUrl: "app/components/base/loading/loading.html",
    animations: [
        trigger("fadeInOut", [
            state(LoadingStatus.Ready.toString(), style({
                opacity: 1,
            })),
            state(LoadingStatus.Loading.toString(), style({
                opacity: 0.25,
            })),
            transition(`* => *`, animate("100ms ease-in")),
        ]),
    ],
})
export class LoadingComponent {
    public statuses = DisplayStatus;
    public displayStatus = new BehaviorSubject<DisplayStatus>(DisplayStatus.Loading);

    @Input()
    public set status(value: LoadingStatus) {
        this._status = value;
        this._updateDisplayStatus();
    }

    public get status() {
        return this._status;
    }

    private _status = LoadingStatus.Loading;
    private _parentDisplayStatus = DisplayStatus.Ready;

    constructor( @SkipSelf() @Optional() private parentLoading: LoadingComponent) {
        // If this loading component is inside another loading component
        if (parentLoading) {
            this.parentLoading.displayStatus.subscribe((parentDisplayStatus) => {
                this._parentDisplayStatus = parentDisplayStatus;
                this._updateDisplayStatus();
            });
        }
    }

    private _updateDisplayStatus() {
        const parentDisplayStatus = this._parentDisplayStatus;
        if (parentDisplayStatus === DisplayStatus.Loading || parentDisplayStatus === DisplayStatus.ParentLoading) {
            this.displayStatus.next(DisplayStatus.ParentLoading);
        } else {
            this.displayStatus.next(<any>this._status);
        }
    }
}

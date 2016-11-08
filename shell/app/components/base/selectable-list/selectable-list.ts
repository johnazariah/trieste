import {
    EventEmitter,
    OnDestroy,
} from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import {  Subscription } from "rxjs";

export class SelectableList implements OnDestroy {

    // @Output()
    public itemSelected = new EventEmitter<string>();

    private _routerSub: Subscription;
    private _activeRouteSub: Subscription;

    constructor(private router: Router, private activatedRoute: ActivatedRoute, paramId: string) {
        this._routerSub = router.events.subscribe(s => {
            if (s instanceof NavigationEnd) {
                if (this._activeRouteSub) {
                    this._activeRouteSub.unsubscribe();
                }
                this._activeRouteSub = activatedRoute.firstChild.params.subscribe((params) => {
                    this.itemSelected.emit(params[paramId] || null);
                });
            }
        });

        // this.subscription = this.activatedRoute.children[0].params.subscribe((params) => {
        //     console.log("Oarams are", paramId, params[paramId]);
        //     this.selectedItemId.next(params[paramId] || null);
        // });
    }

    public ngOnDestroy(): any {
        this._routerSub.unsubscribe();
        this._activeRouteSub.unsubscribe();
    }

}

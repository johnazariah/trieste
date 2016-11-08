import { SidebarManager } from "./sidebar-manager";
import { SidebarPageComponent } from "./sidebar-page";

export class SidebarRef<T> {
    public component: T;
    public page: SidebarPageComponent;

    constructor(private sidebarManager: SidebarManager, public id: string) {
    }

    public reopen() {
        this.sidebarManager.reopen(this);
    }

    public destroy(result?: any) {
        this.sidebarManager.destroy(this);
    }
}

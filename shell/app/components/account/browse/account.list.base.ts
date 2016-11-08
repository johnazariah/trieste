import { AccountService } from "../../../services";
import { Account } from "../../../../app/models";

export abstract class AccountListBase {
    public accounts: Account[];
    public loading: boolean = false;

    constructor(accountService: AccountService) {
        // const accounts$ = accountService.accounts;
        // accounts$.subscribe(accounts => this.accounts = accounts);
        // this.loadAccounts();
    }

    /**
     * Call back to the derived class to set the selected account.
     */
    public abstract onSelectionChanged(account: Account): void;

    /**
     * Called from the HTML template to set the selected item.
     */
    public selectAccount(accountName) {
        const self = this;
        this.accounts.some(function (account, index) {
            return account.name === accountName ? ((self.onSelectionChanged(account)), true) : false;
        });
    }

    // todo: where do i hold the selected account now that we are binding to the server observable data?

    /**
     * Load any saved accounts from persisted storage
     */
    // private loadAccounts() {
    //     this.accounts = [];
    //     this.loading = true;

    //     StorageClient.accounts.list().then((accounts) => {
    //         if (accounts && accounts.length > 0) {
    //             this.accounts = accounts;
    //             const self = this;
    //             const foundDefault = this.accounts.some(function (account, index) {
    //                 return account.isDefault ? ((self.onSelectionChanged(account)), true) : false;
    //             });

    //             if (!foundDefault) {
    //                 this.onSelectionChanged(this.accounts[0]);
    //             }
    //         }
    //     }).catch((error) => {
    //         console.error("loadAccounts() :: error: ", error);
    //     }).then(() => {
    //         this.loading = false;
    //     });
    // }
}

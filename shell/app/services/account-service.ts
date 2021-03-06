import { Injectable } from "@angular/core";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import BatchClient from "../api/batch/batch-client";
import StorageClient from "../api/utils/storage-client";

import { Account } from "../../app/models";

const lastSelectedAccountStorageKey = "last-account-selected-name";

export enum AccountStatus {
    Valid,
    Invalid,
    Loading,
}

@Injectable()
export class AccountService {
    private _accounts: BehaviorSubject<List<Account>> = new BehaviorSubject(List([]));
    private _currentAccount: BehaviorSubject<Account> = new BehaviorSubject(null);
    private _currentAccountValid: BehaviorSubject<AccountStatus> = new BehaviorSubject(AccountStatus.Invalid);

    constructor() {
        this.loadInitialData();

        this.currentAccount.subscribe((account) => {
            if (account) {
                sessionStorage.setItem(lastSelectedAccountStorageKey, account.name);
                BatchClient.setOptions({
                    account: account.name,
                    key: account.key,
                    url: account.url,
                });
                this.validateCurrentAccount();
            } else {
                this._currentAccountValid.next(AccountStatus.Invalid);
            }
        });
    }

    public get accounts(): Observable<Account[]> {
        return new Observable<Account[]>(_ => this._accounts.subscribe(_));
    }

    public get currentAccount(): Observable<Account> {
        return this._currentAccount.asObservable();
    }

    public get currentAccountValid(): Observable<AccountStatus> {
        return this._currentAccountValid.asObservable();
    }

    public selectAccount(account: Account) {
        this._currentAccount.next(account);
    }

    public add(account: Account): Observable<void> {
        let obs: Observable<void> = Observable.fromPromise<void>(StorageClient.accounts.store(account));
        obs.subscribe(
            res => {
                this._accounts.next(this._accounts.getValue().push(account));
            });

        return obs;
    }

    public delete(accountName: string): Observable<void> {
        let obs: Observable<void> = Observable.fromPromise<void>(StorageClient.accounts.delete(accountName));
        obs.subscribe(
            res => {
                let accounts: List<Account> = this._accounts.getValue();
                let index = accounts.findIndex((account) => account.name === accountName);
                this._accounts.next(accounts.delete(index));
            }
        );

        return obs;
    }

    public get(accountName: string): Observable<Account> {
        let obs: Observable<Account> = Observable.fromPromise<Account>(StorageClient.accounts.get(accountName));
        obs.subscribe({
            error: (error) => {
                console.error("Error getting account: ", accountName);
            },
        });

        return obs;
    }

    public validateCurrentAccount() {
        this._currentAccountValid.next(AccountStatus.Loading);

        // Try to list pools from an account(need to get at least 1 pool)
        BatchClient.pool.list({ maxResults: 1 }).fetchNext().then(() => {
            this._currentAccountValid.next(AccountStatus.Valid);

        }).catch((error) => {
            const account = this._currentAccount.getValue();
            console.error(`Could not connect to account '${account.alias}' at '${account.url}'`, error);
            this._currentAccountValid.next(AccountStatus.Invalid);
        });
    }

    private loadInitialData() {
        Observable.fromPromise<Account[]>(StorageClient.accounts.list()).subscribe(
            (accounts) => {
                this._accounts.next(List(accounts));
                const selectedAccountName = sessionStorage.getItem(lastSelectedAccountStorageKey);
                if (selectedAccountName) {
                    const account = accounts.filter(x => x.name === selectedAccountName)[0];
                    if (account) {
                        return this._currentAccount.next(account);

                    }
                }
                // Using the first account as default now TODO change
                if (accounts.length > 0) {
                    this._currentAccount.next(accounts[0]);
                }
            },
            (err) => {
                console.error("Error retrieving accounts");
            }
        );
    }
}

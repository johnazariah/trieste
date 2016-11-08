import { BatchResult } from "../models";

/**
 * List proxy, handle continuation tokens
 */
export class ListProxy {
    private nextLink: string;
    private items: any[];

    private reachEnd = false;
    private currentPromise: Promise<BatchResult> = null;

    constructor(private entity: any, private params: any[], private options: any) {
        this.nextLink = null;
        this.items = [];
        this.params = this.params || [];
    }

    public hasMoreItems(): boolean {
        return !this.reachEnd;
    }

    public fetchNext(id: string): Promise<BatchResult> {
        if (this.currentPromise) {
            return this.currentPromise;
        } else if (!this.hasMoreItems()) {
            return Promise.resolve({
                data: [],
            });
        } else {
            if (this.nextLink) {
                this.currentPromise = this._listNext();
            } else {
                this.currentPromise = this._list();
            }
            this.currentPromise.then(() => {
                this.currentPromise = null;
            });
            this.currentPromise.catch(() => {
                this.currentPromise = null;
            });
            return this.currentPromise;
        }
    }

    private _list(): Promise<BatchResult> {
        return new Promise((resolve, reject) => {
            this.entity.list(...this.params, this.options, (error, result) => {
                this._processResult(result, error, resolve, reject);
            });
        });
    }

    private _listNext(): Promise<BatchResult> {
        return new Promise((resolve, reject) => {
            this.entity.listNext(...this.params, this.nextLink, (error, result) => {
                this._processResult(result, error, resolve, reject);
            });
        });
    }

    private _processResult(result, error, resolve, reject) {
        if (error) {
            reject(error);
        }
        if (result) {
            this.nextLink = result.odatanextLink;
            if (!this.nextLink) {
                this.reachEnd = true;
            }
            this.items.concat(result);
            resolve({
                data: result,
            });
        }
    }
}

import { Map } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { ObjectUtils } from "../../../app/utils/object";

// TODO make target cache(Task cache should not conflict between jobs)
/**
 * Cache storage for entity and list of items.
 * Supports partial updates(OData select)
 */
export class DataCache<T> {
    public items: Observable<Map<string, T>>;
    private _items = new BehaviorSubject<Map<string, T>>(Map<string, T>({}));

    /**
     * @param _uniqueField Each record should have a unqiue field. This is used to update the cache.
     */
    constructor(private _uniqueField = "id") {
        this.items = this._items.asObservable();
    }

    /**
     * Add a new item to the cache.
     * If this item is already there(Same unqiue key) it will just update
     * @param item Item to be added to the cache
     * @param select OData select if applicable.
     *        If specify only the attributtes in that filter will be modified in the cache
     * @return the unique key for the item you added
     */
    public addItem(item: T, select?: string): string {
        const key = this.getItemKey(item);
        const newItems = this._items.getValue().merge({ [key]: this._computeNewItem(item, key, select) });
        this._items.next(newItems);
        return key;
    }

    /**
     * @see addItem
     * Add multiple items as addItem do.
     * @return the list of unique keys
     */
    public addItems(items: T[], select?: string): string[] {
        const newItems: { [key: string]: T } = {};

        const keys = [];
        for (let item of items) {
            const key = this.getItemKey(item);
            keys.push(key);
            newItems[key] = this._computeNewItem(item, key, select);
        }
        this._items.next(this._items.getValue().merge(newItems));
        return keys;
    }

    public getItemKey(item: T) {
        return item[this._uniqueField];
    }

    private _getAttributesList(select: string): string[] {
        return select.split(",");
    }

    private _computeNewItem(item: T, key: string, select?: string): T {
        if (!select) { return item; };
        const oldItem = this._items.getValue().get(key);
        if (!oldItem) { return item; };
        let attributes = ObjectUtils.slice((<any>item).toObject(), this._getAttributesList(select));
        return (<any>oldItem).merge(attributes);
    }
}

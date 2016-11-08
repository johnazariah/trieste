import { BatchRequestOptions } from "./models";
import { DeleteProxy, GetProxy, ListProxy }  from "./shared";

export default class PoolProxy {
    private _getProxy: GetProxy;
    private _deleteProxy: DeleteProxy;

    constructor(private client: any) {
        this._getProxy = new GetProxy(this.client.pool);
        this._deleteProxy = new DeleteProxy(this.client.pool);
    }

    public list(options?: BatchRequestOptions) {
        return new ListProxy(this.client.pool, null, { poolListOptions: options });
    }

    public get(poolId: string, options?: BatchRequestOptions) {
        return this._getProxy.execute(poolId, { poolGetOptions: options });
    }

    public delete(poolId: string, options?: any) {
        return this._deleteProxy.execute(poolId, { poolDeleteMethodOptions: options });
    }
}

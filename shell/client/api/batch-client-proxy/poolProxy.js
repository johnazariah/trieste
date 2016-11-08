"use strict";
var shared_1 = require("./shared");
var PoolProxy = (function () {
    function PoolProxy(client) {
        this.client = client;
        this._getProxy = new shared_1.GetProxy(this.client.pool);
        this._deleteProxy = new shared_1.DeleteProxy(this.client.pool);
    }
    PoolProxy.prototype.list = function (options) {
        return new shared_1.ListProxy(this.client.pool, null, { poolListOptions: options });
    };
    PoolProxy.prototype.get = function (poolId, options) {
        return this._getProxy.execute(poolId, { poolGetOptions: options });
    };
    PoolProxy.prototype.delete = function (poolId, options) {
        return this._deleteProxy.execute(poolId, { poolDeleteMethodOptions: options });
    };
    return PoolProxy;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PoolProxy;
//# sourceMappingURL=poolProxy.js.map
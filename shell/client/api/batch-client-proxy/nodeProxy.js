"use strict";
var shared_1 = require("./shared");
var NodeProxy = (function () {
    function NodeProxy(client) {
        this.client = client;
        this._getProxy = new shared_1.GetProxy(this.client.computeNodeOperations);
    }
    NodeProxy.prototype.list = function (poolId, options) {
        return new shared_1.ListProxy(this.client.computeNodeOperations, [poolId], { computeNodeListOptions: options });
    };
    NodeProxy.prototype.get = function (poolId, nodeId, options) {
        return this._getProxy.executeQ(poolId, nodeId, { computeNodeGetOptions: options });
    };
    return NodeProxy;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NodeProxy;
//# sourceMappingURL=nodeProxy.js.map
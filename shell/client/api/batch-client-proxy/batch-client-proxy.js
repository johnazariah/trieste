//import * as batch from "azure-batch";
"use strict";
var batch = require("azure-batch");
var jobProxy_1 = require("./jobProxy");
var nodeProxy_1 = require("./nodeProxy");
var poolProxy_1 = require("./poolProxy");
var taskProxy_1 = require("./taskProxy");
var BatchClientProxy = (function () {
    function BatchClientProxy() {
    }
    BatchClientProxy.prototype.setOptions = function (options) {
        var credentials = new batch.SharedKeyCredentials(options.account, options.key);
        this._serviceClient = new batch.ServiceClient(credentials, options.url);
        this._job = new jobProxy_1.default(this._serviceClient);
        this._pool = new poolProxy_1.default(this._serviceClient);
        this._task = new taskProxy_1.default(this._serviceClient);
        this._node = new nodeProxy_1.default(this._serviceClient);
    };
    Object.defineProperty(BatchClientProxy.prototype, "job", {
        get: function () {
            return this.checkProxy(this._job);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BatchClientProxy.prototype, "task", {
        get: function () {
            return this.checkProxy(this._task);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BatchClientProxy.prototype, "pool", {
        get: function () {
            return this.checkProxy(this._pool);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BatchClientProxy.prototype, "node", {
        get: function () {
            return this.checkProxy(this._node);
        },
        enumerable: true,
        configurable: true
    });
    BatchClientProxy.prototype.checkProxy = function (proxy) {
        if (!proxy) {
            throw "BatchClientProxy has not been initialized, please call setOptions(options)";
        }
        return proxy;
    };
    return BatchClientProxy;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BatchClientProxy;
//# sourceMappingURL=batch-client-proxy.js.map
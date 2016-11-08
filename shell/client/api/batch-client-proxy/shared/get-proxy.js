"use strict";
/**
 * Get an entity by ID from the Batch client
 */
var GetProxy = (function () {
    function GetProxy(entity) {
        this.entity = entity;
    }
    GetProxy.prototype.execute = function (id, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.entity.get(id, options, function (error, result) {
                if (error) {
                    return reject(error);
                }
                if (result) {
                    return resolve({
                        data: result,
                    });
                }
            });
        });
    };
    GetProxy.prototype.executeQ = function (id1, id2, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.entity.get(id1, id2, options, function (error, result) {
                if (error) {
                    return reject(error);
                }
                if (result) {
                    return resolve({
                        data: result,
                    });
                }
            });
        });
    };
    return GetProxy;
}());
exports.GetProxy = GetProxy;
//# sourceMappingURL=get-proxy.js.map
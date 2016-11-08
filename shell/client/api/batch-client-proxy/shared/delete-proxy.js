"use strict";
/**
 * Delete an entity by ID from the Batch client
 */
var DeleteProxy = (function () {
    function DeleteProxy(entity) {
        this.entity = entity;
    }
    DeleteProxy.prototype.execute = function (id, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.entity.deleteMethod(id, options, function (error, result, request, response) {
                if (error) {
                    return reject(error);
                }
                return resolve();
            });
        });
    };
    return DeleteProxy;
}());
exports.DeleteProxy = DeleteProxy;
//# sourceMappingURL=delete-proxy.js.map
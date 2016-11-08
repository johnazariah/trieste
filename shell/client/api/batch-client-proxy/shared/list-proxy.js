"use strict";
/**
 * List proxy, handle continuation tokens
 */
var ListProxy = (function () {
    function ListProxy(entity, params, options) {
        this.entity = entity;
        this.params = params;
        this.options = options;
        this.reachEnd = false;
        this.currentPromise = null;
        this.nextLink = null;
        this.items = [];
        this.params = this.params || [];
    }
    ListProxy.prototype.hasMoreItems = function () {
        return !this.reachEnd;
    };
    ListProxy.prototype.fetchNext = function (id) {
        var _this = this;
        if (this.currentPromise) {
            return this.currentPromise;
        }
        else if (!this.hasMoreItems()) {
            return Promise.resolve({
                data: [],
            });
        }
        else {
            if (this.nextLink) {
                this.currentPromise = this._listNext();
            }
            else {
                this.currentPromise = this._list();
            }
            this.currentPromise.then(function () {
                _this.currentPromise = null;
            });
            this.currentPromise.catch(function () {
                _this.currentPromise = null;
            });
            return this.currentPromise;
        }
    };
    ListProxy.prototype._list = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            (_a = _this.entity).list.apply(_a, _this.params.concat([_this.options, function (error, result) {
                _this._processResult(result, error, resolve, reject);
            }]));
            var _a;
        });
    };
    ListProxy.prototype._listNext = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            (_a = _this.entity).listNext.apply(_a, _this.params.concat([_this.nextLink, function (error, result) {
                _this._processResult(result, error, resolve, reject);
            }]));
            var _a;
        });
    };
    ListProxy.prototype._processResult = function (result, error, resolve, reject) {
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
    };
    return ListProxy;
}());
exports.ListProxy = ListProxy;
//# sourceMappingURL=list-proxy.js.map
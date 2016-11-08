"use strict";
var shared_1 = require("./shared");
var TaskProxy = (function () {
    function TaskProxy(client) {
        this.client = client;
    }
    TaskProxy.prototype.list = function (jobId, options) {
        return new shared_1.ListProxy(this.client.task, [jobId], { taskListOptions: options });
    };
    return TaskProxy;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TaskProxy;
//# sourceMappingURL=taskProxy.js.map
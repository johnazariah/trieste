"use strict";
var shared_1 = require("./shared");
var JobProxy = (function () {
    function JobProxy(client) {
        this.client = client;
        this._getProxy = new shared_1.GetProxy(this.client.job);
        this._deleteProxy = new shared_1.DeleteProxy(this.client.job);
    }
    JobProxy.prototype.list = function (options) {
        return new shared_1.ListProxy(this.client.job, null, { jobListOptions: options });
    };
    JobProxy.prototype.get = function (jobId, options) {
        return this._getProxy.execute(jobId, { jobGetOptions: options });
    };
    JobProxy.prototype.delete = function (jobId, options) {
        return this._deleteProxy.execute(jobId, { jobDeleteMethodOptions: options });
    };
    JobProxy.prototype.terminate = function (jobId, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client.job.terminate(jobId, { jobTerminateOptions: options }, function (error, result) {
                if (error) {
                    return reject(error);
                }
                return resolve();
            });
        });
    };
    /**
     * Disables the specified job, preventing new tasks from running.
     *
     * @param jobId: The id of the job to disable.
     * @param disableTasks: What to do with active tasks associated with the job.
     *  Possible values include: 'requeue', 'terminate', 'wait'
     * @param options: Optional Parameters.
     */
    JobProxy.prototype.disable = function (jobId, disableTasks, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client.job.disable(jobId, disableTasks, { jobDisableOptions: options }, function (error, result) {
                if (error) {
                    return reject(error);
                }
                return resolve();
            });
        });
    };
    JobProxy.prototype.enable = function (jobId, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client.job.enable(jobId, { jobEnableOptions: options }, function (error, result) {
                if (error) {
                    return reject(error);
                }
                return resolve();
            });
        });
    };
    return JobProxy;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = JobProxy;
//# sourceMappingURL=jobProxy.js.map
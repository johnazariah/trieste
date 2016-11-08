# Copyright (c) Microsoft Corporation
#
# All rights reserved.
#
# MIT License
#
# Permission is hereby granted, free of charge, to any person obtaining a
# copy of this software and associated documentation files (the "Software"),
# to deal in the Software without restriction, including without limitation
# the rights to use, copy, modify, merge, publish, distribute, sublicense,
# and/or sell copies of the Software, and to permit persons to whom the
# Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
# DEALINGS IN THE SOFTWARE.

import azure.common
import azure.storage.blob as azure_storage_blob
import azure.storage.file as azure_storage_file
import azure.storage.queue as azure_storage_queue
import azure.storage.table as azure_storage_table

import azure.batch.batch_auth as batch_auth
import azure.batch.batch_service_client as batch_service_client

import sys
sys.path.append('batch_shipyard')
import batch_shipyard.convoy.fleet as convoy_fleet  # noqa

class ShipyardApi:
    def _get_batch_client(self, config_batch_credentials):
        batch_credentials = batch_auth.SharedKeyCredentials(
            config_batch_credentials['account'],
            config_batch_credentials['account_key'])
        return batch_service_client.BatchServiceClient(
            batch_credentials,
            base_url=config_batch_credentials['account_service_url'])

    def __init__(self, config):
        self.config = config
        self.config["_auto_confirm"] = False

        self.batch_client = self._get_batch_client(
            config['credentials']['batch'])
        self.batch_client.config.add_user_agent(
            'batch-shipyard/{}'.format('2.0.0rc2'))

        config_storage_credentials = \
            config['credentials']['storage']['__storage_account_name__']

        parameters = {
            'account_name': config_storage_credentials['account'],
            'account_key': config_storage_credentials['account_key'],
            'endpoint_suffix': config_storage_credentials['endpoint']
        }

        self.blob_client = azure_storage_blob.BlockBlobService(**parameters)
        self.queue_client = azure_storage_queue.QueueService(**parameters)
        self.table_client = azure_storage_table.TableService(**parameters)

class ClusterApi(ShipyardApi):
    def __init__(self, shipyard_config):
        super(ClusterApi, self).__init__(shipyard_config)


    def create_cluster(self, id, vm_count):
        if id is not None:
            self.config["pool_specification"]["id"] = id
        self.config["pool_specification"]["id"] = id
        self.config["pool_specification"]["vm_count"] = vm_count

        convoy_fleet.populate_global_settings(self.config, True)
        convoy_fleet.adjust_general_settings(self.config)
        convoy_fleet.action_pool_add(
            self.batch_client,
            self.blob_client,
            self.queue_client,
            self.table_client,
            self.config)


    def list_clusters(self):
        return self.batch_client.pool.list()


    def delete_cluster(self, id):
        self.batch_client.pool.delete(id or self.config["pool_specification"]["id"])

class JobApi(ShipyardApi):
    def __init__(self, shipyard_config):
        super(JobApi, self).__init__(shipyard_config)


    def submit_job(self, id, cluster_id, recreate):
        if id is not None:
            self.config["job_specifications"][0]["id"] = id
        if cluster_id is not None:
            self.config["pool_specification"]["id"] = cluster_id
        convoy_fleet.populate_global_settings(self.config, False)
        convoy_fleet.adjust_general_settings(self.config)
        convoy_fleet.action_jobs_add(
            self.batch_client,
            self.blob_client,
            self.config,
            recreate)


    def list_jobs(self):
        return self.batch_client.job.list()


    def list_tasks_for_job(self, job_id):
        return self.batch_client.task.list(job_id or self.config["job_specifications"]["id"])

    def stream_file(self, id, task_id, cluster_id):
        if id is not None:
            self.config["job_specifications"][0]["id"] = id
        if cluster_id is not None:
            self.config["pool_specification"]["id"] = cluster_id
        convoy_fleet.populate_global_settings(self.config, False)
        convoy_fleet.adjust_general_settings(self.config)
        convoy_fleet.action_data_stream(
            self.batch_client,
            self.config,
            "{},{},stderr.txt".format(id, task_id),
            True)



    def delete_job(self, id):
        self.batch_client.job.delete(id or self.config["job_specifications"]["id"])
        pass


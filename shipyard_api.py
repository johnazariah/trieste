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
    def __init__(self, config):
        def set_batch_client(config_batch_credentials):
            batch_credentials = batch_auth.SharedKeyCredentials(
                config_batch_credentials['account'],
                config_batch_credentials['account_key'])

            self.batch_client = batch_service_client.BatchServiceClient(
                batch_credentials,
                base_url=config_batch_credentials['account_service_url'])
            self.batch_client.config.add_user_agent('batch-shipyard/{}'.format('2.0.0rc2'))

        def set_storage_clients(config_storage_credentials):
            parameters = {
                'account_name': config_storage_credentials['account'],
                'account_key': config_storage_credentials['account_key'],
                'endpoint_suffix': config_storage_credentials['endpoint']
            }

            self.blob_client = azure_storage_blob.BlockBlobService(**parameters)
            self.queue_client = azure_storage_queue.QueueService(**parameters)
            self.table_client = azure_storage_table.TableService(**parameters)

        self.config = config
        self.config["batch_shipyard"] = {
            "storage_account_settings": "__storage_account_name__",
            "storage_entity_prefix": "shipyard"
        }
        self.config["global_resources"] = {
            "docker_images": [
                "alfpark/cntk:1.7.2-cpu-openmpi-refdata"
            ]
        }
        self.config["docker_volumes"] = {
            "shared_data_volumes": {
                "glustervol": {
                    "volume_driver": "glusterfs",
                    "container_path": "$AZ_BATCH_NODE_SHARED_DIR/gfs"
                }
            }
        }
        self.config["_auto_confirm"] = False
        self.config["_verbose"] = True

        set_batch_client(config['credentials']['batch'])
        set_storage_clients(config['credentials']['storage']['__storage_account_name__'])

    def call_shipyard_method(self, f):
        convoy_fleet.populate_global_settings(self.config, False)
        convoy_fleet.adjust_general_settings(self.config)
        f()

class ClusterApi(ShipyardApi):
    def __init__(self, shipyard_config):
        super(ClusterApi, self).__init__(shipyard_config)

    def create_cluster(self, cluster_id, vm_size, vm_count):
        def create_pool():
            pool_specification = {
                "id": cluster_id,
                "vm_size": "STANDARD_{}".format(vm_size.upper()),
                "vm_count": vm_count,
                "inter_node_communication_enabled": True,
                "publisher": "Canonical",
                "offer": "UbuntuServer",
                "sku": "16.04.0-LTS",
                "ssh": {
                    "username": "docker"
                },
                "reboot_on_start_task_failed": False,
                "block_until_all_global_resources_loaded": True
            }
            self.config["pool_specification"] = pool_specification
            convoy_fleet.populate_global_settings(self.config, True)
            convoy_fleet.adjust_general_settings(self.config)
            convoy_fleet.action_pool_add(
                self.batch_client,
                self.blob_client,
                self.queue_client,
                self.table_client,
                self.config)

        def create_auto_job():
            job_specification = {
                "id": cluster_id,
                "tasks": []
            }
            if (vm_count > 1):
                job_specification["multi_instance_auto_complete"] = False # review True
            
            self.config["job_specifications"] = [ job_specification ]
            self.call_shipyard_method(lambda:
                convoy_fleet.action_runs_add(
                    self.batch_client,
                    self.blob_client,
                    self.config,
                    True))
        
        create_pool()
        create_auto_job()

    def list_clusters(self):
        return self.batch_client.pool.list()

    def delete_cluster(self, cluster_id):
        self.batch_client.pool.delete(cluster_id)

class RunApi(ShipyardApi):
    def __init__(self, shipyard_config):
        super(RunApi, self).__init__(shipyard_config)

    def submit_run(self, run_id, cluster_id, recreate):
        def build_run_configuration():
            batch_job = self.batch_client.
            self.config["job_specifications"] = {
                "id": run_id,
                "tasks": [
                    {
                        "image": "alfpark/cntk:1.7.2-cpu-openmpi",
                        "remove_container_after_exit": True,
                        "command": cntk_shell_cmd
                    }
                ]
            }
            self.config["pool_specification"]["id"] = cluster_id
        self.call_shipyard_method(lambda:
            convoy_fleet.action_jobs_add(
                self.batch_client,
                self.blob_client,
                self.config,
                False))

    def list_runs_by_cluster(self, cluster_id):
        return self.batch_client.task.list()

    def list_runs_by_cluster(self, cluster_id):
        return self.batch_client.task.list()

    def stream_file(self, run_id, cluster_id):
        self.call_shipyard_method(lambda:
            convoy_fleet.action_data_stream(
                self.batch_client,
                self.config,
                "{},{},stderr.txt".format(cluster_id, run_id),
                True))

    def delete_run(self, run_id):
        self.batch_client.task.delete(id or self.config["run_specifications"]["id"])
        pass

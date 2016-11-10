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

def get_task_config(is_gpu, is_multi_instance = False):
    task_config = {
        (True, True): ("/cntk/run_convnet_mnist_gpu.sh $AZ_BATCH_NODE_SHARED_DIR/gfs", "alfpark/cntk:1.7.2-gpu-openmpi-refdata"),
        (True, False): ("/cntk/run_convnet_mnist_gpu.sh .", "alfpark/cntk:1.7.2-gpu-openmpi-refdata"),
        (False, True): ("mpirun --allow-run-as-root --mca btl_tcp_if_exclude docker0 --host $AZ_BATCH_HOST_LIST /cntk/build-mkl/cpu/release/bin/cntk configFile=/cntk/Examples/Image/Classification/ConvNet/ConvNet_MNIST_Parallel.cntk rootDir=. dataDir=/cntk/Examples/Image/DataSets/MNIST outputDir=$AZ_BATCH_NODE_SHARED_DIR/gfs parallelTrain=true", "alfpark/cntk:1.7.2-cpu-openmpi-refdata"),
        (False, False): ("/bin/bash -c \"/cntk/build-mkl/cpu/release/bin/cntk configFile=/cntk/Examples/Image/Classification/ConvNet/ConvNet_MNIST.cntk rootDir=. dataDir=/cntk/Examples/Image/DataSets/MNIST\"", "alfpark/cntk:1.7.2-cpu-openmpi-refdata")
    }
    return task_config[(is_gpu, is_multi_instance)]

def get_docker_image(vm_size):
    _, docker_image = get_task_config(is_gpu_sku(vm_size))
    return docker_image

def get_task_command(vm_size):
    task_command, _ = get_task_config(is_gpu_sku(vm_size))
    return task_command

def is_gpu_sku(vm_size):
    return (vm_size.upper().startswith('NC') or vm_size.upper().startswith('NV'))

class ShipyardApi:
    def __init__(self, config):
        def include_general_configuration(config):
            config["batch_shipyard"] = {
                "storage_account_settings": "__storage_account_name__",
                "storage_entity_prefix": "shipyard"
            }
            config["global_resources"] = {}
            config["_auto_confirm"] = False
            config["_verbose"] = True
            return config

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

        self.config = include_general_configuration(config)
        set_batch_client(config['credentials']['batch'])
        set_storage_clients(config['credentials']['storage']['__storage_account_name__'])

    def include_pool_configuration(self, cluster_id, vm_size, vm_count):
        def include_docker_volume_configuration(is_multi_instance):
            if is_multi_instance:
                self.config["global_resources"]["docker_volumes"] = {
                    "shared_data_volumes": {
                        "glustervol": {
                            "volume_driver": "glusterfs",
                            "container_path": "$AZ_BATCH_NODE_SHARED_DIR/gfs"
                        }
                    }
                }

        def get_pool_config(cluster_id, vm_size, vm_count):
            driver_url = "<URL for nvidia driver for STANDARD_NC VMs>"

            pool_config = {
                "id": cluster_id,
                "vm_size": vm_size.upper(),
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

            if is_gpu_sku(vm_size):
                pool_config["gpu"] = {
                    "nvidia_driver": {
                        "source": driver_url
                    }
                }
            return pool_config

        include_docker_volume_configuration(vm_count > 1)
        self.config["pool_specification"] = get_pool_config(cluster_id, vm_size, vm_count)
        self.config["global_resources"]["docker_images"] = [ get_docker_image(vm_size) ]

    def add_shipyard_pool(self, pool_name, vm_size, vm_count):
        def create_pool():
            convoy_fleet.populate_global_settings(self.config, True)
            convoy_fleet.adjust_general_settings(self.config)
            convoy_fleet.action_pool_add(
                self.batch_client,
                self.blob_client,
                self.queue_client,
                self.table_client,
                self.config)

        self.include_pool_configuration(pool_name, vm_size, vm_count)
        create_pool()

    def add_shipyard_job(self, job_name, pool_size_info = None):
        def include_job_configuration(job_name, vm_size, vm_count):
            def get_run_task_config(is_gpu_sku, is_multi_instance):
                (docker_image, command) = get_task_config(is_gpu_sku, is_multi_instance)
                run_task_config = {
                    "id": run_id,
                    "image": docker_image,
                    "remove_container_after_exit": True,
                    "command": command
                }
                if is_multi_instance:
                    run_task_config["shared_data_volumes"] = [ "glustervol" ]
                    run_task_config["multi_instance"] = {
                        "num_instances": "pool_specification_vm_count",
                        "coordination_command": None
                    }
                if is_gpu_sku:
                    run_task_config["gpu"] = True

                return run_task_config

            def get_job_config(cluster_id, is_multi_instance, tasks):
                job_config = {
                    "id": cluster_id,
                    "tasks": tasks
                }

                if is_multi_instance:
                    job_config["multi_instance_auto_complete"] = True

                return job_config

            is_multi_instance = (vm_count > 1)
            run_task = get_run_task_config(is_gpu_sku(vm_size), is_multi_instance)
            job_config = get_job_config(job_name, is_multi_instance, [ run_task ])
            self.config["job_specifications"] = [ job_config ]

        (vm_size, vm_count) = pool_size_info if pool_size_info else self.get_existing_pool_size_and_count(job_name)
        include_job_configuration(job_name, vm_size, vm_count)
        self.make_shipyard_call(
            job_name,
            lambda: (convoy_fleet.action_jobs_add(
                self.batch_client,
                self.blob_client,
                self.config,
                True)),
            (vm_size, vm_count))

    def get_existing_pool_size_and_count(self, cluster_id):
        _pool = self.batch_client.pool.get(cluster_id)
        vm_count = _pool.current_dedicated
        vm_size = _pool.vm_size
        return (vm_size, vm_count)

    def make_shipyard_call(self, cluster_id, f, pool_size_info = None):
        (vm_size, vm_count) = pool_size_info if pool_size_info else self.get_existing_pool_size_and_count(job_name)
        self.include_pool_configuration(cluster_id, vm_size, vm_count)
        convoy_fleet.populate_global_settings(self.config, False)
        convoy_fleet.adjust_general_settings(self.config)
        f()

class ClusterApi(ShipyardApi):
    def __init__(self, shipyard_config):
        super(ClusterApi, self).__init__(shipyard_config)

    def create_cluster(self, cluster_id, vm_size, vm_count):
        self.add_shipyard_pool(cluster_id, vm_size, vm_count)
        self.add_shipyard_job(cluster_id, (vm_count, vm_size))

    def list_clusters(self):
        return self.batch_client.pool.list()

    def delete_cluster(self, cluster_id):
        self.batch_client.pool.delete(cluster_id)

class RunApi(ShipyardApi):
    def __init__(self, shipyard_config):
        super(RunApi, self).__init__(shipyard_config)

    def submit_run(self, run_id, cluster_id, cntk_file, root_dir, data_dir):
        self.add_shipyard_job(cluster_id)

    def list_runs_by_cluster(self, cluster_id):
        return self.batch_client.task.list(cluster_id)

    def stream_file(self, run_id, cluster_id):
        self.make_shipyard_call(
            job_name,
            lambda: (convoy_fleet.action_data_stream(
                self.batch_client,
                self.config,
                "{},{},stderr.txt".format(cluster_id, run_id),
                True)))

    def delete_run(self, run_id, cluster_id):
        self.batch_client.task.delete(cluster_id, task_id=run_id)

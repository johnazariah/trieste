#!/usr/bin/env python3

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

from __future__ import division, print_function, unicode_literals

import json
import logging.handlers

import click
import jsonschema
from types import FunctionType as Func
from pymonad.Maybe import *
from collections import namedtuple

try:
    import pathlib
except ImportError:
    import pathlib2 as pathlib

from batch_shipyard.convoy import *

logger = logging.getLogger('trieste')


class TriesteConfig(object):
    def __init__(self):
        self.general_config_file = None
        self.credentials_file = None
        self.config = None


ClientCollection = namedtuple(
    "ClientCollection",
    'batch_client blob_client queue_client table_client')


pass_cli_context = click.make_pass_decorator(TriesteConfig, ensure=True)


def _setup_context(config, pool_add_action=False):
    convoy_fleet.populate_global_settings(config, pool_add_action)
    clients = convoy_fleet.create_clients(config)
    convoy_fleet.adjust_general_settings(config)
    return ClientCollection(clients[0], clients[1], clients[2], clients[3])

def _config_option(f):
    def callback(ctx, param, value):
        ctx_ = value
        ctx_ = ctx.ensure_object(TriesteConfig)
        ctx_.general_config_file = value
        return value

    return click.option(
        '--config',
        default='config/config.json',
        expose_value=False,
        help='(full) path to Configuration JSON file',
        callback=callback)(f)


def _credentials_option(f):
    def callback(ctx, param, value):
        ctx_ = ctx.ensure_object(TriesteConfig)
        ctx_.credentials_file = value
        return value

    return click.option(
        '--credentials-config',
        expose_value=False,
        default='config/credentials.json',
        help='(full) path to Credentials JSON file',
        callback=callback)(f)


def common_options(f):
    f = _config_option(f)
    f = _credentials_option(f)
    return f


def _read_file_to_json(file: str):
    # type: str -> Maybe[dict]
    with open(file) as data:
        try:
            return Just(json.load(data))
        except Exception as e:
            print("Failed to read the file:")
            return Nothing()

def _to_shipyard_config(
        config_file,
        schema_file,
        converter_func):
    # type: (str, str, Func) -> Maybe[dict]
    def convert(x):
        return Just(converter_func(x))

    return (
        _read_file_to_json(config_file) >>
        _validate_json_against_schema(schema_file) >>
        convert
    )

@curry
def _validate_json_against_schema(
        schema_file: str,
        _json):
    # type: str -> Maybe[dict] -> Maybe[dict]
    with open(schema_file) as schema:
        _schema = json.load(schema)
        try:
            jsonschema.validate(_json, _schema)
            return Just(_json)
        except jsonschema.ValidationError as e:
            print("Failed to validate json with ValidationError:")
            return Nothing
        except jsonschema.SchemaError as e:
            print("Failed to validate json with SchemaError:")
            return Nothing



@click.group()
@click.pass_context
def cli(ctx):
    """Azure Deep Learning Toolkit"""
    pass


@cli.group()
@pass_cli_context
def cluster(ctx):
    """Cluster actions"""
    pass


@cluster.command('create')
@click.option(
    '--cluster-config',
    default='config/cluster-config.json',
    help='(full) path to Pool Configuration JSON file'
)
@click.option(
    '--id',
    default='cntk-cluster',
    help='The (optional) name of the cluster to create.'
)
@common_options
@pass_cli_context
def cluster_create(ctx, cluster_config, id):
    """Create a cluster with the specified configuration file"""
    inputs = [
        (ctx.credentials_file,    "api/schema/credentials-schema.json", _to_shipyard_credentials),
        (ctx.general_config_file, "api/schema/config-schema.json", _to_shipyard_global_config),
        (cluster_config, "api/schema/cluster-config-schema.json", _to_shipyard_pool_config)
    ]

    def to_config(tuple): 
        return _to_shipyard_config(tuple[0], tuple[1], tuple[2])

    configs = map(to_config, inputs)

    for c in configs:
        print(c)

    # shipyard_credentials = _to_shipyard_config(
    #     ctx.credentials_file,
    #     "api/schema/credentials-schema.json",
    #     _to_shipyard_credentials)

    # shipyard_config = _to_shipyard_config(
    #     ctx.general_config_file,
    #     "api/schema/config-schema.json",
    #     _to_shipyard_global_config)
    
    # shipyard_pool_config = _to_shipyard_config(
    #     cluster_config,
    #     "api/schema/cluster-config-schema.json",
    #     _to_shipyard_pool_config)

    # print (shipyard_credentials)
    # print (shipyard_config)
    # print (shipyard_pool_config)

    #shipyard_pool_config["pool_specification"]["id"] = id

    # clients = setup_context(ctx.config, True)
    # convoy_fleet.action_pool_add(
    #     clients.batch_client,
    #     clients.blob_client,
    #     clients.queue_client,
    #     clients.table_client,
    #     ctx.config)


@cli.group()
@pass_cli_context
def job(ctx):
    """Job actions"""
    pass


# @click.command()
# @click.option('--config',
#               default="config.json",
#               help='(full) path to Configuration JSON file')
# @click.option('--pool-config',
#               default="cluster-config.json",
#               help='(full) path to Pool Configuration JSON file')
# @click.option('--job-config',
#               default="job-config.json",
#               help='(full) path to Job Configuration JSON file')
# def main(config, pool_config, job_config):
#     shipyard_config = _to_shipyard_config(
#         config,
#         "api/schema/credentials-schema.json",
#         _to_shipyard_credentials)

#     shipyard_pool_config = _to_shipyard_config(
#         pool_config,
#         "api/schema/cluster-config-schema.json",
#         _to_shipyard_pool_config)

#     shipyard_job_config = _to_shipyard_config(
#         job_config,
#         "api/schema/job-config-schema.json",
#         _to_shipyard_job_config)

#     ctx.config = convoy_util.merge_dict(shipyard_pool_config)
#     print(shipyard_pool_config.getValue())
#     print(shipyard_job_config.getValue())



def _to_shipyard_pool_config(trieste_cluster_config):
    return {
        "pool_specification": {
            "id": trieste_cluster_config["id"],
            "vm_size": trieste_cluster_config["vm_size"],
            "vm_count": trieste_cluster_config["vm_count"],
            "inter_node_communication_enabled": True,
            "publisher": "Canonical",
            "offer": "UbuntuServer",
            "sku": "16.04.0-LTS",
            "ssh_docker_tunnel": {
                "username": "docker",
                "generate_tunnel_script": True
            },
            "reboot_on_start_task_failed": True,
            "block_until_all_global_resources_loaded": True
        }
    }


def _to_shipyard_job_config(trieste_job_config):
    config_file_arg = " configFile={}" \
        .format(trieste_job_config["config_file"])
    root_dir_arg = " RootDir={}" \
        .format(trieste_job_config["input_directory"])
    cntk_cmd = "/cntk/build/cpu/release/bin/cntk{}{}" \
        .format(config_file_arg, root_dir_arg)

    prep_cmd = "cp -r /cntk/Examples/Image/MNIST/* . "
    cntk_shell_cmd = '/bin/bash -c "{} && {}"'.format(prep_cmd, cntk_cmd)

    return {
        "job_specifications": [
            {
                "id": trieste_job_config["id"],
                "tasks": [
                    {
                        "image": "alfpark/cntk:cpu-openmpi-mnist-cifar",
                        "remove_container_after_exit": True,
                        "command": cntk_shell_cmd
                    }
                ]
            }
        ]
    }


def _to_shipyard_global_config(trieste_config):
    return {
        "batch_shipyard": {
            "storage_account_settings": "__storage_account_name__",
            "storage_entity_prefix": "shipyard"
        },
        "global_resources": {
            "docker_images": [
                "alfpark/cntk:1.7.2-cpu-openmpi-refdata"
            ]
        }
    }

def _to_shipyard_credentials(trieste_credentials_config):
    return {
    "credentials": {
        "batch": {
            "account": trieste_credentials_config["credentials"]["batch"]["account"],
            "account_key": trieste_credentials_config["credentials"]["batch"]["account_key"],
            "account_service_url": trieste_credentials_config["credentials"]["batch"]["account_service_url"]
        },
        "storage": {
            "__storage_account_name__": {
                "account": trieste_credentials_config["credentials"]["storage"]["account"],
                "account_key": trieste_credentials_config["credentials"]["storage"]["account_key"],
                "endpoint": "core.windows.net"
            }
        }
    }
}


if __name__ == '__main__':
    cli()

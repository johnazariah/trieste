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

import logging.handlers
from collections import namedtuple

import click

try:
    import pathlib
except ImportError:
    import pathlib2 as pathlib

import configurations

from shipyard_api import ClusterApi
from shipyard_api import RunApi

logger = logging.getLogger('trieste')

class TriesteConfig(object):
    def __init__(self):
        self.general_config_file = None
        self.credentials_file = None
        self.config = None
        self.verbose = False

pass_cli_context = click.make_pass_decorator(TriesteConfig, ensure=True)


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


def _verbose_option(f):
    def callback(ctx, param, value):
        ctx_ = ctx.ensure_object(TriesteConfig)
        ctx_.verbose = value
        return value
    return click.option(
        '--verbose',
        expose_value=False,
        default=False,
        is_flag=True,
        help='Verbose output',
        callback=callback)(f)

def common_options(f):
    f = _config_option(f)
    f = _credentials_option(f)
    f = _verbose_option(f)
    return f


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
    '--cluster-id',
    default=None,
    help='The (optional) name of the cluster to create'
)
@click.option('--vm-size', 
    type=click.Choice([
    'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11',
    'D1', 'D2', 'D3', 'D4', 'D11', 'D12', 'D13', 'D14',
    'D1_V2', 'D2_V2', 'D3_V2', 'D4_V2', 'D5_V2', 'D11_V2', 'D12_V2', 'D13_V2', 'D14_V2','D15_V2',
    'F1', 'F2', 'F4', 'F8', 'F16',
    'G1', 'G2', 'G3', 'G4', 'G5',
    'H8', 'H16', 'H8M', 'H16M', 'H16R', 'H16MR',
    'NV6', 'NV12', 'NV24', 'NC6', 'NC12', 'NC24']),
    help='The size of the Azure VM to provision the cluster with')
@click.option(
    '--vm-count',
    default=1,
    help='The (optional) number of nodes required in the cluster'
)
@common_options
@pass_cli_context
def cluster_create(ctx, cluster_config, cluster_id, vm_size, vm_count):
    """Create a cluster with the specified configuration file"""
    inputs = [
        (ctx.credentials_file, "api/schema/credentials-schema.json",
         configurations.to_shipyard_credentials)
    ]
    config = configurations.get_merged_shipyard_config(inputs, {})
    cluster_api = ClusterApi(config)
    cluster_api.create_cluster(cluster_id, vm_size, vm_count)

@cluster.command('list')
@common_options
@pass_cli_context
def cluster_list(ctx):
    """List all clusters"""
    inputs = [
        (ctx.credentials_file, "api/schema/credentials-schema.json",
         configurations.to_shipyard_credentials)
    ]
    config = configurations.get_merged_shipyard_config(inputs, {})
    cluster_api = ClusterApi(config)
    clusters = cluster_api.list_clusters()

    for c in clusters:
        print(c.id)


@cluster.command('delete')
@click.option(
    '--cluster-config',
    default='config/cluster-config.json',
    help='(full) path to Pool Configuration JSON file'
)
@click.option(
    '--id',
    default=None,
    help='The (optional) name of the cluster to delete. This overrides the value in the cluster-config file'
)
@common_options
@pass_cli_context
def cluster_delete(ctx, id):
    """Delete a cluster with the specified configuration name"""
    inputs = [
        (ctx.credentials_file, "api/schema/credentials-schema.json",
         configurations.to_shipyard_credentials)
    ]
    config = configurations.get_merged_shipyard_config(inputs)
    cluster_api = ClusterApi(config)
    cluster_api.delete_cluster(id)


@cli.group()
@pass_cli_context
def run(ctx):
    """Run actions"""
    pass

@run.command('submit')
@click.option(
    '--run-id',
    default=None,
    help='The (optional) name of the run to submit. This overrides the value in the run-config file'
)
@click.option(
    '--cluster-id',
    default=None,
    help='The (optional) name of the cluster to submit to. This overrides the value in the cluster-config file'
)
@common_options
@pass_cli_context
def run_submit(ctx, run_config, cluster_config, id, cluster_id):
    """Submit a run to the specified cluster"""
    inputs = [
        (ctx.credentials_file, "api/schema/credentials-schema.json",
         configurations.to_shipyard_credentials)
    ]
    config = configurations.get_merged_shipyard_config(inputs)
    run_api = RunApi(config)
    run_api.submit_run(id, cluster_id, recreate)


@run.command('list')
@common_options
@pass_cli_context
def run_list(ctx):
    """List all runs"""
    inputs = [
        (ctx.credentials_file, "api/schema/credentials-schema.json",
         configurations.to_shipyard_credentials)
    ]
    config = configurations.get_merged_shipyard_config(inputs)
    run_api = RunApi(config)

    runs = run_api.list_runs()
    for j in runs:
        print(j.id)


@run.command('stream-file')
@click.option(
    '--run-config',
    default='config/run-config.json',
    help='(full) path to run Configuration JSON file'
)
@click.option(
    '--run-id',
    default=None,
    help='The (optional) name of the run to get output for'
)
@click.option(
    '--cluster-id',
    default=None,
    help='The (optional) name of the run to get tasks for'
)
@common_options
@pass_cli_context
def stream_file(ctx, run_config, run_id, task_id, cluster_config, cluster_id):
    """Stream the output file of the specified task"""
    inputs = [
        (ctx.credentials_file, "api/schema/credentials-schema.json",
         configurations.to_shipyard_credentials)
    ]

    config = configurations.get_merged_shipyard_config(inputs)
    config["_verbose"] = ctx.verbose
    run_api = RunApi(config)
    run_api.stream_file(run_id, task_id, cluster_id)

@run.command('delete')
@click.option(
    '--run-config',
    default='config/run-config.json',
    help='(full) path to run Configuration JSON file'
)
@click.option(
    '--id',
    default=None,
    help='The (optional) name of the run to delete. This overrides the value in the run-config file'
)
@common_options
@pass_cli_context
def run_delete(ctx, run_config, id):
    """Delete a cluster with the specified configuration name"""
    inputs = [
        (ctx.credentials_file, "api/schema/credentials-schema.json",
         configurations.to_shipyard_credentials)
    ]
    config = configurations.get_merged_shipyard_config(inputs)
    run_api = RunApi(config)
    run_api.delete_run(id)

if __name__ == '__main__':
    cli()

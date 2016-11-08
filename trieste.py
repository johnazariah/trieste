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
from shipyard_api import JobApi

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
    '--cluster-config',
    default='config/cluster-config.json',
    help='(full) path to Pool Configuration JSON file'
)
@click.option(
    '--id',
    default=None,
    help='The (optional) name of the cluster to create. This overrides the value in the cluster-config file'
)
@click.option(
    '--vm-count',
    default=1,
    help='The (optional) number of nodes required in the cluster.'
)
@common_options
@pass_cli_context
def cluster_create(ctx, cluster_config, id, vm_count):
    """Create a cluster with the specified configuration file"""
    inputs = [
        (ctx.credentials_file, "api/schema/credentials-schema.json",
         configurations.to_shipyard_credentials),
        (ctx.general_config_file, "api/schema/config-schema.json",
         configurations.to_shipyard_global_config),
        (cluster_config, "api/schema/cluster-config-schema.json",
         configurations.to_shipyard_pool_config)
    ]

    config = configurations.get_merged_shipyard_config(inputs)
    config["_verbose"] = ctx.verbose

    cluster_api = ClusterApi(config)
    cluster_api.create_cluster(id, vm_count)


@cluster.command('list')
@common_options
@pass_cli_context
def cluster_list(ctx):
    """List all clusters"""
    inputs = [
        (ctx.credentials_file, "api/schema/credentials-schema.json",
         configurations.to_shipyard_credentials),
        (ctx.general_config_file, "api/schema/config-schema.json",
         configurations.to_shipyard_global_config)
    ]
    config = configurations.get_merged_shipyard_config(inputs)
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
         configurations.to_shipyard_credentials),
        (ctx.general_config_file, "api/schema/config-schema.json",
         configurations.to_shipyard_global_config),
        (cluster_config, "api/schema/cluster-config-schema.json",
         configurations.to_shipyard_pool_config)
    ]
    config = configurations.get_merged_shipyard_config(inputs)
    cluster_api = ClusterApi(config)
    cluster_api.delete_cluster(id)


@cli.group()
@pass_cli_context
def job(ctx):
    """Job actions"""
    pass

@job.command('submit')
@click.option(
    '--job-config',
    default='config/job-config.json',
    help='(full) path to Job Configuration JSON file'
)
@click.option(
    '--cluster-config',
    default='config/cluster-config.json',
    help='(full) path to Pool Configuration JSON file'
)
@click.option(
    '--id',
    default=None,
    help='The (optional) name of the job to submit. This overrides the value in the job-config file'
)
@click.option(
    '--cluster-id',
    default=None,
    help='The (optional) name of the cluster to submit to. This overrides the value in the cluster-config file'
)
@click.option(
    '--recreate', is_flag=True,
    help='Recreate any completed jobs with the same id')
@common_options
@pass_cli_context
def job_submit(ctx, job_config, cluster_config, id, cluster_id, recreate):
    """Submit a job to the specified cluster"""
    inputs = [
        (ctx.credentials_file, "api/schema/credentials-schema.json",
         configurations.to_shipyard_credentials),
        (ctx.general_config_file, "api/schema/config-schema.json",
         configurations.to_shipyard_global_config),
        (job_config, "api/schema/job-config-schema.json",
         configurations.to_shipyard_job_config),
        (cluster_config, "api/schema/cluster-config-schema.json",
         configurations.to_shipyard_pool_config)
    ]

    config = configurations.get_merged_shipyard_config(inputs)
    config["_verbose"] = ctx.verbose

    job_api = JobApi(config)
    job_api.submit_job(id, cluster_id, recreate)


@job.command('list')
@common_options
@pass_cli_context
def job_list(ctx):
    """List all jobs"""
    inputs = [
        (ctx.credentials_file, "api/schema/credentials-schema.json",
         configurations.to_shipyard_credentials),
        (ctx.general_config_file, "api/schema/config-schema.json",
         configurations.to_shipyard_global_config)
    ]
    config = configurations.get_merged_shipyard_config(inputs)
    job_api = JobApi(config)

    jobs = job_api.list_jobs()
    for j in jobs:
        print(j.id)


@job.command('list-tasks')
@click.option(
    '--job-config',
    default='config/job-config.json',
    help='(full) path to Job Configuration JSON file'
)
@click.option(
    '--job-id',
    default=None,
    help='The (optional) name of the job to get tasks for. This overrides the value in the job-config file'
)
@common_options
@pass_cli_context
def task_list(ctx, job_config, job_id):
    """List all tasks in the specified job"""
    inputs = [
        (ctx.credentials_file, "api/schema/credentials-schema.json",
         configurations.to_shipyard_credentials),
        (ctx.general_config_file, "api/schema/config-schema.json",
         configurations.to_shipyard_global_config),
        (job_config, "api/schema/job-config-schema.json",
         configurations.to_shipyard_job_config)
    ]
    config = configurations.get_merged_shipyard_config(inputs)
    job_api = JobApi(config)

    tasks = job_api.list_tasks_for_job(job_id)
    for t in tasks:
        print(t.id)


@job.command('stream-file')
@click.option(
    '--job-config',
    default='config/job-config.json',
    help='(full) path to Job Configuration JSON file'
)
@click.option(
    '--job-id',
    default=None,
    help='The (optional) name of the job to get tasks for. This overrides the value in the job-config file'
)
@click.option(
    '--task-id',
    default=None,
    help='The (optional) name of the job to get tasks for. This overrides the value in the job-config file'
)
@click.option(
    '--cluster-config',
    default='config/cluster-config.json',
    help='(full) path to Pool Configuration JSON file'
)
@click.option(
    '--cluster-id',
    default=None,
    help='The (optional) name of the cluster to submit to. This overrides the value in the cluster-config file'
)
@common_options
@pass_cli_context
def stream_file(ctx, job_config, job_id, task_id, cluster_config, cluster_id):
    """Stream the output file of the specified task"""
    inputs = [
        (ctx.credentials_file, "api/schema/credentials-schema.json",
         configurations.to_shipyard_credentials),
        (ctx.general_config_file, "api/schema/config-schema.json",
         configurations.to_shipyard_global_config),
        (job_config, "api/schema/job-config-schema.json",
         configurations.to_shipyard_job_config),
        (cluster_config, "api/schema/cluster-config-schema.json",
         configurations.to_shipyard_pool_config)
    ]

    config = configurations.get_merged_shipyard_config(inputs)
    config["_verbose"] = ctx.verbose
    job_api = JobApi(config)
    job_api.stream_file(job_id, task_id, cluster_id)

@job.command('delete')
@click.option(
    '--job-config',
    default='config/job-config.json',
    help='(full) path to Job Configuration JSON file'
)
@click.option(
    '--id',
    default=None,
    help='The (optional) name of the job to delete. This overrides the value in the job-config file'
)
@common_options
@pass_cli_context
def job_delete(ctx, job_config, id):
    """Delete a cluster with the specified configuration name"""
    inputs = [
        (ctx.credentials_file, "api/schema/credentials-schema.json",
         configurations.to_shipyard_credentials),
        (ctx.general_config_file, "api/schema/config-schema.json",
         configurations.to_shipyard_global_config),
        (job_config, "api/schema/job-config-schema.json",
         configurations.to_shipyard_job_config)
    ]
    config = configurations.get_merged_shipyard_config(inputs)
    job_api = JobApi(config)
    job_api.delete_job(id)

if __name__ == '__main__':
    cli()

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
from batch_shipyard import convoy

import click

try:
    import pathlib
except ImportError:
    import pathlib2 as pathlib


import configurations

import sys
sys.path.append('batch_shipyard')
import batch_shipyard.convoy.fleet  # noqa
print(batch_shipyard.convoy.fleet._ROOT_PATH)

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
    convoy.fleet.populate_global_settings(config, pool_add_action)
    clients = convoy.fleet.create_clients(config)
    convoy.fleet.adjust_general_settings(config)
    return ClientCollection(*clients)


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
        (ctx.credentials_file, "api/schema/credentials-schema.json",
         configurations.to_shipyard_credentials),
        (ctx.general_config_file, "api/schema/config-schema.json",
         configurations.to_shipyard_global_config),
        (cluster_config, "api/schema/cluster-config-schema.json",
         configurations.to_shipyard_pool_config)
    ]
    ctx.config = configurations.get_merged_shipyard_config(inputs)
    ctx.config["pool_specification"]["id"] = id

    print(ctx.config)
    # clients = _setup_context(ctx.config, True)
    # print(clients.batch_client)

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


if __name__ == '__main__':
    cli()

import copy
import json
import jsonschema
from pymonad.Maybe import *

try:
    reduce
except NameError:
    from functools import reduce

def _read_file_to_json(file: str):
    # type: str -> Maybe[dict]
    with open(file) as data:
        try:
            return Just(json.load(data))
        except Exception as e:
            print("Failed to read the file:")
            return Nothing()

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

@curry
def _merge_dict(dict1, dict2):    
    if not isinstance(dict1, dict) or not isinstance(dict2, dict):
        raise ValueError('dict1 or dict2 is not a dictionary')
    result = copy.deepcopy(dict1)
    for k, v in dict2.items():
        if k in result and isinstance(result[k], dict):
            result[k] = _merge_dict(result[k], v)
        else:
            result[k] = copy.deepcopy(v)
    return result

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
    
def get_merged_shipyard_config(inputs):
    def to_config_opt(tuple): 
        return _to_shipyard_config(*tuple)
    
    def plus(left, right):
        return Just(_merge_dict).amap(left).amap(right)
    
    zero = Just({})
    result_opt = reduce(plus, map(to_config_opt, inputs), zero)

    return result_opt.getValue()

def to_shipyard_pool_config(trieste_cluster_config):
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


def to_shipyard_job_config(trieste_job_config):
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


def to_shipyard_global_config(trieste_config):
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

def to_shipyard_credentials(trieste_credentials_config):
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

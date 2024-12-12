"""
The following module contains all the tools we need to read and parse configuration paths
"""
import tomllib
from pathlib import Path


def verify_and_parse_config(config_path: Path) -> dict:

    with open(config_path, 'rb') as f:
        c = tomllib.load(f)

    # Transcribing might be redundant, but lets me check and add defaults as needed.
    ret = {}

    if 'create_testing_environment' in c:
        ret['create_testing_environment'] = c['create_testing_environment']
    else:
        ret['create_testing_environment'] = False

    if 'lairs_directory' not in c:
        raise ValueError("dragon_lair not found in config file")
    ret['lairs_directory'] = c['lairs_directory']

    if 'resource_path' not in c:
        raise ValueError("resource_path not found in config file")
    ret['resource_path'] = c['resource_path']

    if 'users' not in c:
        raise ValueError("users not found in config file")
    ret['users'] = {u["email"]: u["name"] for u in c['users']}

    if 'url_host' not in c:
        raise ValueError("url_host not found in config file")
    ret['url_host'] = c['url_host']

    if 'api_url_prefix' not in c:
        raise ValueError("api_url_prefix not found in config file")
    ret['api_url_prefix'] = c['api_url_prefix']

    if 'traefik_host' not in c:
        raise ValueError("traefik_host not found in config file")
    ret['traefik_host'] = c['traefik_host']

    return ret

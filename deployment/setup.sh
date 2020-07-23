#!/bin/bash
set -e

source deployment/env

ssh -i ${PEM_FILE_LOCATION} ${INSTANCE_NAME} \
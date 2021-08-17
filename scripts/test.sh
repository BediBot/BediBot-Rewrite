#!/bin/bash

set -euxo pipefail #Exit if a command fails, log everything to terminal

npm run prestart
npm run test

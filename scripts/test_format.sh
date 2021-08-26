#!/bin/bash

clang-format -style=file -Werror --dry-run -i src/*.ts src/**/*.ts src/**/**/*.ts

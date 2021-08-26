#!/bin/bash

echo "Running clang-format"

clang-format --version

clang-format -style=file -i src/*.ts src/**/*.ts src/**/**/*.ts

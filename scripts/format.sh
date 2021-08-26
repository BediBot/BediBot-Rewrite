#!/bin/bash

echo "Running clang-format"

clang-format --version

find src -regex '.*\.\(ts\)' -exec clang-format -style=file -i {} \;

#!/bin/sh
unoserver > /dev/null &
yarn nest start
# Exit with status of process that exited first
exit $?
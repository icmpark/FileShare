#!/bin/sh
unoserver > /dev/null &
yarn start
# Exit with status of process that exited first
exit $?
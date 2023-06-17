#!/bin/sh
unoserver > /dev/null &
# yarn nest start --debug --watch
# Exit with status of process that exited first
exit $?
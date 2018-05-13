#!/bin/bash
function bell() {
  while true; do
    echo -e "\a"
    sleep 60
  done
}
set -e
git config --global push.default simple
git remote add prod ssh://travis@gzaripov.com/~/optical-system-simulator/
bell & git push prod master
exit $?
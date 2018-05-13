#!/bin/bash
set -e
./travis_wait -i 60 -l 60 -x 0 -a 1 "make -j2 v=S" "build.log"
git config --global push.default simple
git remote add prod ssh://travis@gzaripov.com/~/optical-system-simulator/
git push prod master
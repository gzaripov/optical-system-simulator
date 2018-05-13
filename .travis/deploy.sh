#!/bin/bash
set -e
pwd
ls
git config --global push.default simple
git remote add prod ssh://travis@gzaripov.com/~/optical-system-simulator/
git push prod master
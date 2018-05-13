#!/bin/bash
set -e
ls -al .travis
git config --global push.default simple
git remote add prod ssh://travis@gzaripov.com/~/optical-system-simulator/
git push prod master
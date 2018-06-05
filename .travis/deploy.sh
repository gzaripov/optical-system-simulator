#!/bin/bash
set -e
git config --global push.default simple
git remote add prod ssh://travis@gzaripov.com/~/optical-system-simulator/
ssh travis@gzaripov.com "cd ~/optical-system-simulator/; git reset --hard HEAD"
git push prod master
ssh travis@gzaripov.com "cd ~/optical-system-simulator/; yarn install; yarn build"
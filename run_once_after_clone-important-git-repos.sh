#!/bin/bash

cd ~/source
for repo in "eabrouwer3/ebrouwer.dev" "eabrouwer3/advent-of-code"; do
  git clone "git@github.com:${repo}.git"
done

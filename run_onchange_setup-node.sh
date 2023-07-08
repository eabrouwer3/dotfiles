#!/bin/bash

for version in "14" "16" "18"; do
    nvm install $version
    npm install -g npm all-the-package-names
done
```

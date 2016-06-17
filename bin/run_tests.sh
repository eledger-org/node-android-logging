#!/bin/bash



echo "=============MOCHA===============" && \
  ./node_modules/mocha/bin/mocha
echo "==============END================"

echo "=============ESLINT==============" && \
  node ./node_modules/eslint/bin/eslint.js index.js example test && echo "Eslint passed."
echo "==============END================"

echo "==============FIN================"


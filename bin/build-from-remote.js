#!/usr/bin/env node

const fs = require('fs');
const { getSourcesFromRemote } = require('../src/sources');
const { parseSources } = require('../src/parse');
const { generateDist } = require('../src/print');

getSourcesFromRemote()
  .then(parseSources)
  .then(generateDist)
  .then(() => console.log('Site generated to /dist using remote sources'));

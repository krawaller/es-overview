#!/usr/bin/env node

const fs = require('fs');
const { getSourcesFromDisk } = require('../src/sources');
const { parseSources } = require('../src/parse');
const { generateDist } = require('../src/print');

getSourcesFromDisk()
  .then(parseSources)
  .then(generateDist)
  .then(() => console.log('Site generated to /dist using locally saved sources'));

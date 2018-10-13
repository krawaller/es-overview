#!/usr/bin/env node

const fs = require('fs');
const { getSourcesFromDisk } = require('../src/sources');
const { parseSources } = require('../src/parse');
const { printTemplate } = require('../src/print');

getSourcesFromDisk().then(sources => {
  const proposals = parseSources(sources);
  try { fs.mkdirSync('dist'); } catch(e) {}
  fs.writeFileSync('dist/index.html', printTemplate(proposals));
  console.log('Site generated to /dist using locally saved sources');
});

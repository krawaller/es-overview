#!/usr/bin/env node

const fs = require('fs');
const { getSourcesFromRemote } = require('../src/sources');
const { parseSources } = require('../src/parse');
const { printTemplate } = require('../src/print');

getSourcesFromRemote().then(sources => {
  const proposals = parseSources(sources);
  try { fs.mkdirSync('dist'); } catch(e) {}
  fs.writeFileSync('dist/index.html', printTemplate(proposals));
  console.log('Site generated to /dist using sources collected remotely');
});

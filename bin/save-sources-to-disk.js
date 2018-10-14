#!/usr/bin/env node

const { getSourcesFromRemote, saveSourcesToDisk } = require('../src/sources');

getSourcesFromRemote()
  .then(saveSourcesToDisk)
  .then(() => console.log('Source files downloaded and saved to disk'));

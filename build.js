const fs = require('fs');
const { getSourcesFromDisk, getSourcesFromRemote, saveSourcesToDisk } = require('./src/sources');
const { parseSources } = require('./src/parse');
const { printTemplate } = require('./src/print');

// /* for local testing, do this once: */
// getSourcesFromRemote().then(writeSourcesToDisk);
// /* and then use getSourcesFromDisk instead down below!

getSourcesFromDisk().then(sources => {
  const proposals = parseSources(sources);
  try { fs.mkdirSync('dist'); } catch(e) {}
  fs.writeFileSync('dist/index.html', printTemplate(proposals));
});

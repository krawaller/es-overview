const fetch = require('node-fetch');
const fs = require('fs');

function getSourcesFromRemote() {
  return Promise.all([
    fetch('https://github.com/tc39/proposals/blob/master/README.md').then(res => res.text()),
    fetch('https://github.com/tc39/proposals/blob/master/stage-0-proposals.md').then(res => res.text()),
    fetch('https://github.com/tc39/proposals/blob/master/finished-proposals.md').then(res => res.text()),
    fetch('https://github.com/tc39/proposals/blob/master/inactive-proposals.md').then(res => res.text())
  ]).then(([active, zero, finished, inactive]) => ({ active, zero, finished, inactive }));
}

function saveSourcesToDisk(sources) {
  try { fs.mkdirSync('sources'); } catch(e) {}
  return Promise.all([
    new Promise(resolve => fs.writeFile('sources/active.html', sources.active, resolve)),
    new Promise(resolve => fs.writeFile('sources/zero.html', sources.zero, resolve)),
    new Promise(resolve => fs.writeFile('sources/finished.html', sources.finished, resolve)),
    new Promise(resolve => fs.writeFile('sources/inactive.html', sources.inactive, resolve)),
  ]).then(() => console.log('Sources written to file in the "/sources" directory'));
};

function getSourcesFromDisk() {
  return Promise.all([
    new Promise(resolve => fs.readFile('sources/active.html', (err, f) => resolve(f.toString()))),
    new Promise(resolve => fs.readFile('sources/zero.html', (err, f) => resolve(f.toString()))),
    new Promise(resolve => fs.readFile('sources/finished.html', (err, f) => resolve(f.toString()))),
    new Promise(resolve => fs.readFile('sources/inactive.html', (err, f) => resolve(f.toString())))
  ]).then(([active, zero, finished, inactive]) => ({ active, zero, finished, inactive }));
}

module.exports = { getSourcesFromRemote, saveSourcesToDisk, getSourcesFromDisk };

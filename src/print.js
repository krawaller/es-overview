const fs = require('fs');
const path = require('path');
const { sortGroups, sortProposals } = require('./sort');
const { latest } = require('./constants');

function printProposal(proposal) {
  const classes = [
    'proposal',
    proposal.ascend && 'ascending',
    proposal.url && 'hasLink'
  ].filter(c => !!c).join(' ');
  const searchText = proposal.name.replace(/<\/?code>/g, '').toLowerCase();
  const blob = JSON.stringify(proposal);
  return `<div class="${classes}" data-blob='${blob}' data-search-text="${searchText}">${proposal.name}</div>`;
}

function printGroup(name, proposals) {
  const past = name.startsWith('ES') && parseInt(name.slice(2)) <= latest;
  const classes = [
    'group',
    name,
    past ? 'past' : 'future',
    name.match(latest) && 'current',
    name.match(latest + 1) && 'near-future',
  ].filter(c => !!c).join(' ');
  return `
  <div class="${classes}">
    ${ name.match(latest) ? '<div id="pastmarker"><span>past<br/>↓</span></div>' : '' }
    <h3>${name}</h3>
    <div class="proposals">
      ${ sortProposals(proposals).map(printProposal).join('\n') }
    </div>
    ${ name.match(latest + 1) ? '<div id="futuremarker"><span>↑<br/>future</span></div>' : '' }
  </div>`;
}

const template = fs.readFileSync(path.join(__dirname, '../static/template.html')).toString();

function printTemplate(proposals) {
  const overviewContent = sortGroups(Object.keys(proposals))
    .map(key => printGroup(key, proposals[key]))
    .join('\n');
  return template.replace('<div id="overview"></div>', `<div id="overview">${overviewContent}</div>`);
}

const polyfill = fs.readFileSync(path.join(__dirname, '../node_modules/intersection-observer/intersection-observer.js'));
const scripts = fs.readFileSync(path.join(__dirname, '../static/scripts.js')).toString();
const styles = fs.readFileSync(path.join(__dirname, '../static/styles.css')).toString();

function generateDist(proposals) {
  try { fs.mkdirSync(path.join(__dirname, '../dist')) } catch(e) {}
  return Promise.all([
    new Promise(resolve => fs.writeFile(path.join(__dirname, '../dist/index.html'), printTemplate(proposals), resolve)),
    new Promise(resolve => fs.writeFile(path.join(__dirname, '../dist/polyfill.js'), polyfill, resolve)),
    new Promise(resolve => fs.writeFile(path.join(__dirname, '../dist/styles.css'), styles, resolve)),
    new Promise(resolve => fs.writeFile(path.join(__dirname, '../dist/scripts.js'), scripts, resolve)),
  ]);
}

module.exports = { generateDist };

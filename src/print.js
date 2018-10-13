const fs = require('fs');
const path = require('path');
const { sortGroups, sortProposals } = require('./sort');

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
  const current = (new Date()).getFullYear();
  const past = name.startsWith('ES') && parseInt(name.slice(2)) <= current;
  const classes = [
    'group',
    name,
    past ? 'past' : 'future',
    name.match(current) && 'current',
    name.match(current + 1) && 'near-future',
  ].filter(c => !!c).join(' ');
  return `<div class="${classes}">
    <h3>${name}</h3>
    <div class="proposals">
      ${ sortProposals(proposals).map(printProposal).join('\n') }
    </div>
  </div>`;
}

const template = fs.readFileSync(path.join(__dirname, '../static/template.html')).toString();
const scripts = fs.readFileSync(path.join(__dirname, '../static/scripts.js')).toString();
const styles = fs.readFileSync(path.join(__dirname, '../static/styles.css')).toString();

function printTemplate(proposals) {
  const overviewContent = sortGroups(Object.keys(proposals))
    .map(key => printGroup(key, proposals[key]))
    .join('\n');
  return template
    .replace('<div id="overview"></div>', `<div id="overview">${overviewContent}</div>`)
    .replace('</head>', `<style>${styles}</style></head>`)
    .replace('</body>', `<script>${scripts}</script></body>`);
}

module.exports = { printTemplate };

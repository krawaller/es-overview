const fs = require('fs');
const { sortGroups, sortProposals } = require('./sort');

function printProposal(proposal) {
  const classes = [
    'proposal',
    proposal.ascend && 'ascending',
    proposal.url && 'hasLink'
  ].filter(c => !!c).join(' ');
  const searchText = proposal.name.replace(/<\/?code>/g, '').toLowerCase();
  return `<div class="${classes}" data-search-text="${searchText}">${proposal.url ? `<a href="${proposal.url}" target="_blank">${proposal.name}</a>` : proposal.name}</div>`;
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

const template = fs.readFileSync('template.html').toString();

function printTemplate(proposals) {
  return template.replace(
    'OVERVIEWCONTENT',
    sortGroups(Object.keys(proposals))
      .map(key => printGroup(key, proposals[key]))
      .join('\n')
    );
}

module.exports = { printTemplate };

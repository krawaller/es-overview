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

function writeSourcesToFiles(sources) {
  try { fs.mkdirSync('sources'); } catch(e) {}
  return Promise.all([
    new Promise(resolve => fs.writeFile('sources/active.html', sources.active, resolve)),
    new Promise(resolve => fs.writeFile('sources/zero.html', sources.zero, resolve)),
    new Promise(resolve => fs.writeFile('sources/finished.html', sources.finished, resolve)),
    new Promise(resolve => fs.writeFile('sources/inactive.html', sources.inactive, resolve)),
  ]).then(() => console.log('Sources written to file in the "/sources" directory'));
};

function getSourcesFromFiles() {
  return Promise.all([
    new Promise(resolve => fs.readFile('sources/active.html', (err, f) => resolve(f.toString()))),
    new Promise(resolve => fs.readFile('sources/zero.html', (err, f) => resolve(f.toString()))),
    new Promise(resolve => fs.readFile('sources/finished.html', (err, f) => resolve(f.toString()))),
    new Promise(resolve => fs.readFile('sources/inactive.html', (err, f) => resolve(f.toString())))
  ]).then(([active, zero, finished, inactive]) => ({ active, zero, finished, inactive }));
}

function parseActive(activeSource) {
  return activeSource
    .replace(/ *[\n\r] */g, '') // remove all newlines so we can use . in regex
    .match(/user-content-stage-\d.*?<\/table>/g) // crop to general vicinity of the three tables
    .map(stage => stage.match(/<tbody>(.*?)<\/tbody>/)[1]) // isolate the table bodies
    .map(stage => stage.replace(/^<tr>|<\/tr>$/g,'').split('</tr><tr>')) // isolate each proposal in a string
    .map(stage => stage.map(row => row.replace(/^<td>|<\/td>$/g,'').split('</td><td>'))) // split proposals into cell contents
    .map((stage, sidx) => stage.map(proposal => ({ // make proposal into readable object
      ascend: !!proposal[0],
      name: (proposal[1].match(/<a [^>]*>(.*?)<\/a>/) || [])[1] || proposal[1],
      url: (proposal[1].match(/href=["']([^"']*)["']/) || [])[1],
      author: proposal[2],
      champion: proposal[3],
      group: `stage${3 - sidx}` // we get the stages in order [3,2,1]
    })))
    .reduce((mem, stage) => mem.concat(stage), []) // flatten to single array
}

function parseFinished(finishedSource) {
  return finishedSource
    .replace(/ *[\n\r] */g, '') // remove all newlines so we can use . in regex
    .match(/user-content-finished-proposals.*?<tbody>(.*?)<\/tbody>/)[1] // isolate table body content
    .replace(/^<tr>|<\/tr>$/g,'').split('</tr><tr>') // isolate each proposal in a string
    .map(row => row.replace(/^<td>|<\/td>$/g,'').split('</td><td>')) // split proposals into cell contents
    .map(proposal => ({ // make proposal into readable object
      name: (proposal[0].match(/<a [^>]*>(.*?)<\/a>/) || [])[1] || proposal[1],
      url: (proposal[0].match(/href=["']([^"']*)["']/) || [])[1],
      author: proposal[1],
      champion: proposal[2],
      group: `ES${proposal[4]}`
    }));
}

function parseZero(zeroSource) {
  return zeroSource
    .replace(/ *[\n\r] */g, '') // remove all newlines so we can use . in regex
    .match(/user-content-stage-0-proposals.*?<tbody>(.*?)<\/tbody>/)[1] // isolate table body content
    .replace(/^<tr>|<\/tr>$/g,'').split('</tr><tr>') // isolate each proposal in a string
    .map(row => row.replace(/^<td>|<\/td>$/g,'').split('</td><td>')) // split proposals into cell contents
    .map(proposal => ({ // make proposal into readable object
      ascend: !!proposal[0],
      name: (proposal[1].match(/<a [^>]*>(.*?)<\/a>/) || [])[1] || proposal[1],
      url: (proposal[1].match(/href=["']([^"']*)["']/) || [])[1],
      author: proposal[2],
      champion: proposal[3],
      group: 'stage0'
    }));
}

function parseInactive(inactiveSource) {
  return inactiveSource
    .replace(/ *[\n\r] */g, '') // remove all newlines so we can use . in regex
    .match(/user-content-inactive-proposals.*?<tbody>(.*?)<\/tbody>/)[1] // isolate table body content
    .replace(/^<tr>|<\/tr>$/g,'').split('</tr><tr>') // isolate each proposal in a string
    .map(row => row.replace(/^<td>|<\/td>$/g,'').split('</td><td>')) // split proposals into cell contents
    .map(proposal => ({ // make proposal into readable object
      name: (proposal[0].match(/<a [^>]*>(.*?)<\/a>/) || [])[1] || proposal[0],
      url: (proposal[0].match(/href=["']([^"']*)["']/) || [])[1],
      champion: proposal[1],
      rationale: proposal[2],
      group: 'inactive'
    }));
}

function sortProposals(proposals) {
  const kill = /^ *<code>["']?|^["']/;
  return proposals.sort((p1, p2) => p1.name.replace(kill, '').toLowerCase() > p2.name.replace(kill, '').toLowerCase())
}

function getProposalGroupsFromSources(sources) {
  return [
    ...parseZero(sources.zero),
    ...parseActive(sources.active),
    ...parseFinished(sources.finished),
    ...parseInactive(sources.inactive)
  ]
  .reduce((mem, prop) => ({
    ...mem,
    [prop.group]: (mem[prop.group] || []).concat(prop)
  }), {});
}

function printProposal(proposal) {
  const classes = [
    'proposal',
    proposal.ascend && 'ascending',
    proposal.url && 'hasLink'
  ].filter(c => !!c).join(' ');
  return `<div class="${classes}">${proposal.url ? `<a href="${proposal.url}" target="_blank">${proposal.name}</a>` : proposal.name}</div>`;
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

function sortGroups(groups) {
  return groups.sort((a, b) =>
    a === 'inactive' ? 1
    : b === 'inactive' ? -1
    : a.startsWith('ES') && b.startsWith('ES') ? a < b
    : a.startsWith('ES') ? 1
    : b.startsWith('ES') ? -1
    : +b[5] < +a[5]
  );
}

function populateTemplate(template, proposals) {
  return template.replace(
    'OVERVIEWCONTENT',
    sortGroups(Object.keys(proposals))
      .map(key => printGroup(key, proposals[key]))
      .join('\n')
    );
}

// /* for local testing, do this once: */
// getSourcesFromRemote().then(writeSourcesToFiles);
// /* and then use getSourcesFromFiles instead down below!

getSourcesFromRemote().then(sources => {
  const proposals = getProposalGroupsFromSources(sources);
  const template = fs.readFileSync('template.html').toString();
  try { fs.mkdirSync('dist'); } catch(e) {}
  fs.writeFileSync('dist/index.html', populateTemplate(template, proposals));
});

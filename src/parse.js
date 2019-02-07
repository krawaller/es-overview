const { latest } = require('./constants');

function parseActiveSource(activeSource) {
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

function parseFinishedSource(finishedSource) {
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
      group: `ES${proposal[4]}${proposal[4] > latest ? ' (stage4)' : ''}`
    }));
}

function parseZeroSource(zeroSource) {
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

function parseInactiveSource(inactiveSource) {
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

function parseSources(sources) {
  return [
    ...parseZeroSource(sources.zero),
    ...parseActiveSource(sources.active),
    ...parseFinishedSource(sources.finished),
    ...parseInactiveSource(sources.inactive)
  ]
  .reduce((mem, prop) => ({
    ...mem,
    [prop.group]: (mem[prop.group] || []).concat(prop)
  }), {});
}

module.exports = { parseSources };


function sortProposals(proposals) {
  const kill = /^ *<code>["']?|^["']/;
  return proposals.sort((p1, p2) => p1.name.replace(kill, '').toLowerCase() > p2.name.replace(kill, '').toLowerCase())
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

module.exports = { sortProposals, sortGroups };

var lastSearchResult = [];
var overview = document.querySelector("#overview");
document.querySelector('#searchbar').addEventListener('input', function(e){
  var term = e.target.value.toLowerCase();
  for(var i=0; i<lastSearchResult.length; i++) { lastSearchResult[i].classList.remove('found'); }
  if (term) {
    lastSearchResult = document.querySelectorAll('[data-search-text*="' + term + '"]');
    for(var i=0; i<lastSearchResult.length; i++) { lastSearchResult[i].classList.add('found'); }
    overview.classList.add('filtered');
  } else {
    overview.classList.remove('filtered');
  }
});

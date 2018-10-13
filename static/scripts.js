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

var modal = document.querySelector("#modal");
var modalContent = modal.querySelector("#modalcontent");
modal.addEventListener('click', function(e) {
  if (!e.target.matches('a')) {
    document.body.classList.remove('modalvisible');
  }
});
document.querySelector('#overview').addEventListener('click', function(e){
  var prop = e.target.matches('.proposal') ? e.target : e.target.closest('.proposal');
  if (prop) {
    var data = JSON.parse(prop.getAttribute("data-blob"));
    modalContent.innerHTML = (
      '<h4>' + data.name + '</h4>' + 
      '<dl>' +
      '<dt>Status</dt><dd>' + data.group + '</dd>' +
      (data.author ? '<dt>Author</dt><dd>' + data.author + '</dd>' : '') +
      (data.champion ? '<dt>Champion</dt><dd>' + data.champion + '</dd>' : '') +
      (data.url ? '<dt>Link</dt><dd><a href="' + data.url + '" target="_blank">' + data.url + '</a></dd>' : '') +
      '</dl>'
    );
    document.body.classList.add('modalvisible');
  }
});

var nearFuture = document.querySelector('.near-future');
var current = document.querySelector('.current');
var root = document.querySelector('.overview');

//current.insertAdjacentHTML('beforebegin', '<div id="futuremarker">↑\A future</div>');

var intersectionObserver = new IntersectionObserver(handleIntersect, {
  root: root
});
intersectionObserver.observe(current);
function handleIntersect(entries) {
  for(var i=0; i < entries.length; i++) {
    var entry = entries[i];
    if (entry.target === current) {
      document.body.classList[entry.isIntersecting ? 'add' : 'remove']('pastVisible');
    }
  }
}
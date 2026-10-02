// pierrelucbacon.com
(function () {
  // Assemble the email address so it is not sitting in the HTML.
  var addr = ['pierre-luc.bacon', 'mila.quebec'].join('@');
  document.querySelectorAll('[data-mail]').forEach(function (a) {
    a.href = 'mailto:' + addr;
    if (a.hasAttribute('data-show')) a.textContent = addr;
  });

  // Publication filter.
  var input = document.getElementById('pub-filter');
  if (!input) return;
  var box = input.closest('.filter');
  var count = document.getElementById('pub-count');
  var none = document.querySelector('.no-match');
  var years = Array.prototype.slice.call(document.querySelectorAll('.row.year'));
  var fold = function (s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  };
  var items = [];
  years.forEach(function (y) {
    var label = y.querySelector('.label').textContent;
    y.querySelectorAll('.pub').forEach(function (li) {
      items.push({ li: li, year: y, text: fold(li.textContent + ' ' + label) });
    });
  });
  var total = items.length;
  box.hidden = false;

  function apply() {
    var terms = fold(input.value).split(/\s+/).filter(Boolean);
    var shown = 0;
    var visibleYears = new Set();
    items.forEach(function (it) {
      var ok = terms.every(function (t) { return it.text.indexOf(t) !== -1; });
      it.li.hidden = !ok;
      if (ok) { shown++; visibleYears.add(it.year); }
    });
    years.forEach(function (y) { y.hidden = !visibleYears.has(y); });
    count.textContent = terms.length ? shown + ' of ' + total + ' papers' : total + ' papers';
    none.hidden = shown !== 0;
  }
  input.addEventListener('input', apply);
  var q = new URLSearchParams(location.search).get('q');
  if (q) { input.value = q; apply(); }
})();

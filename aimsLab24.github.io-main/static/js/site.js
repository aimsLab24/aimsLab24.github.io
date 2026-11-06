(function () {
  var body = document.body;
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && body.classList.contains('nav-open')) {
        body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function rng(seed) {
    return function () {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  }

  function sideWeight(x, w, inner) {
    var d = Math.abs(x - w / 2) / (w / 2);
    var t = Math.min(1, Math.max(0, (d - inner) / (1 - inner)));
    return t * t * (3 - 2 * t);
  }

  function pixelArt(w, h, rand) {
    var narrow = w < 820;
    var c = narrow ? 22 : 26;
    var gap = 3;
    var inner = narrow ? 0.7 : 0.3;
    var dim = narrow ? 0.6 : 1;
    var rows = Math.ceil(h / c), cols = Math.ceil(w / c), out = '';
    for (var r = 0; r < rows; r++) {
      for (var q = 0; q < cols; q++) {
        var x = q * c, y = r * c;
        var k = sideWeight(x + c / 2, w, inner);
        if (rand() > k * 0.85) continue;
        var o = (0.05 + rand() * 0.2) * (0.4 + k * 0.6) * dim;
        var fill = rand() < 0.18 ? '#c9cbf2' : '#ffffff';
        out += '<rect x="' + (x + gap / 2) + '" y="' + (y + gap / 2) + '" width="' + (c - gap) + '" height="' + (c - gap) + '" rx="2" fill="' + fill + '" fill-opacity="' + o.toFixed(3) + '"/>';
      }
    }
    return out;
  }

  function drawArt() {
    document.querySelectorAll('.head-art').forEach(function (el, i) {
      var w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' + pixelArt(w, h, rng(97 + i)) + '</svg>';
    });
  }
  drawArt();
  var artW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (Math.abs(window.innerWidth - artW) < 40) return;
    artW = window.innerWidth;
    drawArt();
  });

  document.querySelectorAll('[data-count-of]').forEach(function (el) {
    var target = document.getElementById(el.dataset.countOf);
    if (target) el.textContent = target.querySelectorAll('.pub').length;
  });

  var indexLinks = document.querySelectorAll('.pubs-index a');
  if (indexLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    indexLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          indexLinks.forEach(function (a) { a.classList.remove('current'); });
          var a = map[en.target.id];
          if (a) a.classList.add('current');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }

  var photos = document.querySelectorAll('.photo-btn');
  if (photos.length) {
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML = '<img alt=""><button class="lightbox-close" type="button" aria-label="닫기">×</button>';
    body.appendChild(box);
    var boxImg = box.querySelector('img');
    var lastBtn = null;
    function close() {
      box.classList.remove('open');
      if (lastBtn) lastBtn.focus();
    }
    photos.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var img = btn.querySelector('img');
        boxImg.src = img.src;
        boxImg.alt = img.alt;
        lastBtn = btn;
        box.classList.add('open');
        box.querySelector('.lightbox-close').focus();
      });
    });
    box.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && box.classList.contains('open')) close();
    });
  }

  document.querySelectorAll('[data-download-start]').forEach(function (group) {
    var start = new Date(group.dataset.downloadStart + 'T00:00:00');
    var end = new Date(group.dataset.downloadEnd + 'T23:59:59');
    var label = group.dataset.downloadLabel;
    var now = new Date();
    var open = now >= start && now <= end;
    var before = now < start;
    var status = group.querySelector('.status');
    if (status) {
      status.textContent = open ? '다운로드 가능' : (before ? '오픈 예정' : '기간 종료');
      status.classList.toggle('open', open);
      status.classList.toggle('soon', before);
    }
    var period = group.querySelector('.period');
    if (period) {
      var ratio = before ? 0 : Math.min(1, (now - start) / (end - start));
      period.style.setProperty('--p', (ratio * 100).toFixed(1) + '%');
      period.classList.toggle('closed', !open && !before);
    }
    var note = group.querySelector('.period-note');
    if (note) {
      var day = 86400000;
      if (open) {
        note.textContent = '마감까지 ' + Math.max(1, Math.ceil((end - now) / day)) + '일 남았습니다.';
      } else if (before) {
        note.textContent = Math.ceil((start - now) / day) + '일 뒤부터 받을 수 있습니다.';
      } else {
        note.textContent = '다운로드 기간이 끝났습니다.';
      }
    }
    group.querySelectorAll('a[download]').forEach(function (a) {
      if (!open) a.classList.add('is-closed');
      a.addEventListener('click', function (e) {
        var t = new Date();
        if (t < start || t > end) {
          e.preventDefault();
          alert('다운로드 가능 기간이 아닙니다. (기간 : ' + label + ')');
        }
      });
    });
  });
})();

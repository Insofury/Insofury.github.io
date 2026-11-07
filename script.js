(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle ---------- */
  var themeBtn = document.getElementById('themeToggle');
  function setThemeLabel() {
    var t = root.getAttribute('data-theme');
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0a0f1c' : '#f7f9fc');
  }
  setThemeLabel();
  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    setThemeLabel();
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById('menuToggle');
  var nav = document.getElementById('nav');
  function closeMenu() {
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  }
  menuBtn.addEventListener('click', function () {
    var open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('open') && !e.target.closest('#nav') && !e.target.closest('#menuToggle')) closeMenu();
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) closeMenu();
  });

  /* ---------- Header shadow + back-to-top ---------- */
  var header = document.getElementById('header');
  var toTop = document.getElementById('toTop');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('scrolled', y > 8);
    toTop.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Rotating role text ---------- */
  var rotator = document.getElementById('rotator');
  var roles = [
    'Jama Connect Subject Matter Expert',
    'Requirements Management & ALM',
    'Data Migration & Integrations',
    'Automotive SPICE Provisional Assessor'
  ];
  if (rotator && !reduceMotion) {
    var ri = 0, ci = roles[0].length, deleting = true;
    var tick = function () {
      var word = roles[ri];
      if (deleting) {
        ci--;
        rotator.textContent = word.slice(0, ci);
        if (ci <= 0) { deleting = false; ri = (ri + 1) % roles.length; }
        setTimeout(tick, 28);
      } else {
        var target = roles[ri];
        ci++;
        rotator.textContent = target.slice(0, ci);
        if (ci >= target.length) { deleting = true; setTimeout(tick, 2200); }
        else setTimeout(tick, 55);
      }
    };
    setTimeout(tick, 2600);
  }

  /* ---------- Experience: show more ---------- */
  var lists = document.querySelectorAll('.job-points[data-visible]');
  Array.prototype.forEach.call(lists, function (list, idx) {
    var visible = parseInt(list.getAttribute('data-visible'), 10) || 4;
    var items = list.children;
    if (items.length <= visible) return;
    for (var i = visible; i < items.length; i++) items[i].classList.add('extra');
    list.classList.add('collapsed');
    if (!list.id) list.id = 'job-points-' + idx;

    var extra = items.length - visible;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'more-btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', list.id);
    btn.innerHTML = '<span>Show ' + extra + ' more</span><svg class="ic" aria-hidden="true"><use href="#i-chevron"/></svg>';
    list.parentNode.insertBefore(btn, list.nextSibling);

    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      list.classList.toggle('collapsed', expanded);
      btn.setAttribute('aria-expanded', String(!expanded));
      btn.querySelector('span').textContent = expanded ? 'Show ' + extra + ' more' : 'Show less';
    });
  });

  /* ---------- Copy email ---------- */
  var copyBtn = document.getElementById('copyEmail');
  if (copyBtn) {
    var label = copyBtn.querySelector('.copy-label');
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.getAttribute('data-email');
      var done = function () {
        copyBtn.classList.add('copied');
        label.textContent = 'Copied!';
        setTimeout(function () { copyBtn.classList.remove('copied'); label.textContent = 'Copy email'; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, function () { fallbackCopy(email); done(); });
      } else { fallbackCopy(email); done(); }
    });
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(reveals, function (el, i) {
      // small stagger for siblings
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = Math.min(sib, 5) * 60 + 'ms';
      io.observe(el);
    });
  } else {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('in'); });
  }

  /* ---------- Active nav link ---------- */
  var links = document.querySelectorAll('.nav-links a[href^="#"]');
  var map = {};
  Array.prototype.forEach.call(links, function (a) { map[a.getAttribute('href').slice(1)] = a; });
  var sections = Object.keys(map).map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          Array.prototype.forEach.call(links, function (a) { a.classList.remove('active'); });
          var a = map[entry.target.id];
          if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();

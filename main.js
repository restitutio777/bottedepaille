/* Élise Margaux — interactions
   Quiet, slow, intentional. Everything degrades gracefully. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Footer year ---- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---- Header: condense on scroll ---- */
  var header = document.getElementById('header');
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---- Scroll reveal (fade + rise) ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Gentle parallax on tagged images ---- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (parallaxEls.length && !reduceMotion) {
    var ticking = false;
    var apply = function () {
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var progress = (rect.top + rect.height / 2 - vh / 2) / vh; // -~1..1
        var amt = parseFloat(el.getAttribute('data-parallax')) || 0.06;
        el.style.transform = 'translate3d(0,' + (-progress * amt * 100).toFixed(2) + 'px,0)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(apply); ticking = true; }
    }, { passive: true });
    apply();
  }

  /* ---- Custom cursor (fine pointers only) ---- */
  var fine = window.matchMedia('(pointer: fine)').matches;
  var cursor = document.querySelector('.cursor');
  if (cursor && fine && !reduceMotion) {
    var cx = 0, cy = 0, tx = 0, ty = 0, raf;
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add('is-visible');
      if (!raf) loop();
    });
    document.addEventListener('mouseleave', function () { cursor.classList.remove('is-visible'); });
    function loop() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      // position via left/top so `transform` stays free for the hover scale
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(loop) : null;
    }
    // grow near imagery & interactive elements
    var hot = document.querySelectorAll('figure, a, button, input, textarea');
    hot.forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hover'); });
    });
  }

  /* ---- Mobile menu ---- */
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    var setMenu = function (open) {
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', function () {
      setMenu(!document.body.classList.contains('menu-open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
    });
  }

  /* ---- Contact form (no backend yet) ---- */
  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('.form-note');
      var email = form.querySelector('input[name="email"]');
      if (email && email.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
        if (note) note.textContent = 'A valid email helps me reach you.';
        email.focus();
        return;
      }
      if (note) note.textContent = 'Thank you — your story is on its way. I’ll be in touch soon.';
      form.reset();
    });
  }
})();

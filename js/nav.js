/* ─────────────────────────────────────────────────────────────────────────
   QuickRide Africa — Navigation
   Scroll-aware transparent→dark transition · Mobile full-screen menu
───────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const nav    = document.getElementById('site-nav');
  const toggle = document.getElementById('nav-toggle');
  const mobile = document.getElementById('nav-mobile');
  const SCROLL_THRESHOLD = 80;

  if (!nav) return;

  /* ─── Scroll-aware nav ──────────────────────────────────────────────── */

  const hasHero = document.querySelector('.hero') !== null;

  function updateNav() {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;

    if (hasHero) {
      nav.classList.toggle('site-nav--transparent', !scrolled);
      nav.classList.toggle('site-nav--scrolled', scrolled);
    } else {
      nav.classList.add('site-nav--solid');
    }
  }

  // Initial state
  updateNav();

  // Listen for scroll (throttled via rAF)
  let ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateNav();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* ─── Footer year ──────────────────────────────────────────────────── */

  document.querySelectorAll('.footer__copy').forEach(function (el) {
    el.innerHTML = el.innerHTML.replace(/\d{4}/, new Date().getFullYear());
  });

  /* ─── Active page link ──────────────────────────────────────────────── */

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('nav__link--active');
    }
  });

  /* ─── Mobile menu ───────────────────────────────────────────────────── */

  if (!toggle || !mobile) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    mobile.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    isOpen = false;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    mobile.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', function () {
    isOpen ? closeMenu() : openMenu();
  });

  // Close on mobile nav link click
  mobile.querySelectorAll('.nav__mobile-link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

})();

/* ─────────────────────────────────────────────────────────────────────────
   QuickRide Africa — Scroll Animations
   IntersectionObserver-based reveal system + fleet drag-scroll
───────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* Respect prefers-reduced-motion */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Reveal on scroll ──────────────────────────────────────────────── */

  if (!reducedMotion) {
    const revealEls = document.querySelectorAll('[data-reveal]');

    if (revealEls.length > 0 && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );

      revealEls.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      /* Fallback: show immediately */
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }
  } else {
    /* Motion reduced: skip animation, show all */
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ─── Fleet gallery drag scroll ─────────────────────────────────────── */

  document.querySelectorAll('.fleet-gallery').forEach(function (gallery) {
    let isDown = false;
    let startX, scrollLeft;

    gallery.addEventListener('mousedown', function (e) {
      isDown = true;
      gallery.classList.add('is-dragging');
      startX = e.pageX - gallery.offsetLeft;
      scrollLeft = gallery.scrollLeft;
      e.preventDefault();
    });

    gallery.addEventListener('mouseleave', function () {
      isDown = false;
      gallery.classList.remove('is-dragging');
    });

    gallery.addEventListener('mouseup', function () {
      isDown = false;
      gallery.classList.remove('is-dragging');
    });

    gallery.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      const x    = e.pageX - gallery.offsetLeft;
      const walk = (x - startX) * 1.5;
      gallery.scrollLeft = scrollLeft - walk;
    });

    /* Touch support */
    let touchStartX, touchScrollLeft;

    gallery.addEventListener('touchstart', function (e) {
      touchStartX    = e.touches[0].pageX;
      touchScrollLeft = gallery.scrollLeft;
    }, { passive: true });

    gallery.addEventListener('touchmove', function (e) {
      const diff = touchStartX - e.touches[0].pageX;
      gallery.scrollLeft = touchScrollLeft + diff;
    }, { passive: true });
  });

  /* ─── FAQ accordion ─────────────────────────────────────────────────── */

  document.querySelectorAll('.faq-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const item = trigger.closest('.faq-item');
      const isOpen = item.classList.contains('is-open');

      /* Close all others */
      document.querySelectorAll('.faq-item.is-open').forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove('is-open');
          openItem.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('is-open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ─── Hero headline line-reveal (stagger on load) ───────────────────── */

  if (!reducedMotion) {
    const heroContent = document.querySelector('.hero__content');
    if (heroContent) {
      const els = heroContent.querySelectorAll('.hero__eyebrow, .hero__headline, .hero__sub, .hero__ctas');
      els.forEach(function (el, i) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 700ms cubic-bezier(0.16,1,0.3,1), transform 700ms cubic-bezier(0.16,1,0.3,1)';
        el.style.transitionDelay = (100 + i * 130) + 'ms';
      });

      /* Trigger after a paint */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          els.forEach(function (el) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          });
        });
      });
    }
  }

})();

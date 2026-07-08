/* ─────────────────────────────────────────────────────────────────────────
   QuickRide Africa — Multi-Step Booking Form
   6-step state machine · per-step validation · conditional flight section
───────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const form         = document.getElementById('quote-form');
  if (!form) return;

  const steps        = Array.from(form.querySelectorAll('.form-step'));
  const dots         = Array.from(document.querySelectorAll('.step-dot'));
  const btnNext      = form.querySelectorAll('[data-next]');
  const btnBack      = form.querySelectorAll('[data-back]');
  const flightSection = document.getElementById('flight-section');
  const serviceSelect = document.getElementById('service-required');

  let current = 0;
  const TOTAL = steps.length;
  let isPopping = false;

  /* ─── Step URL tracking (virtual pageviews for GTM) ───────────────────── */

  function pushStepURL(index) {
    if (isPopping) return;
    var url = new URL(window.location.href);
    url.searchParams.set('step', index + 1);
    history.pushState({ step: index + 1 }, '', url.toString());
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'virtualPageview',
      virtualPagePath: url.pathname + url.search
    });
  }

  window.addEventListener('popstate', function () {
    var params = new URLSearchParams(window.location.search);
    var stepParam = parseInt(params.get('step'), 10);
    var targetIndex = (stepParam >= 1 && stepParam <= TOTAL) ? stepParam - 1 : 0;
    if (targetIndex === current) return;
    isPopping = true;
    if (targetIndex > current) {
      goTo(targetIndex);
    } else {
      goBack(targetIndex);
    }
    isPopping = false;
  });

  /* ─── Navigation ────────────────────────────────────────────────────── */

  function goTo(index) {
    steps[current].classList.remove('is-active');
    dots[current].classList.remove('step-dot--active');
    dots[current].classList.add('step-dot--done');

    current = index;

    steps[current].classList.add('is-active');
    dots[current].classList.remove('step-dot--done');
    dots[current].classList.add('step-dot--active');

    // Scroll to top of form
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    pushStepURL(current);
  }

  function goBack(index) {
    steps[current].classList.remove('is-active');
    dots[current].classList.remove('step-dot--active', 'step-dot--done');

    current = index;

    steps[current].classList.add('is-active');
    dots[current].classList.remove('step-dot--done');
    dots[current].classList.add('step-dot--active');

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    pushStepURL(current);
  }

  btnNext.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (validate(current)) {
        if (current < TOTAL - 1) {
          goTo(current + 1);
        } else {
          submitForm();
        }
      }
    });
  });

  btnBack.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (current > 0) goBack(current - 1);
    });
  });

  /* ─── Validation ─────────────────────────────────────────────────────── */

  function validate(stepIndex) {
    const step = steps[stepIndex];
    let valid = true;

    // Reset errors
    step.querySelectorAll('.form-field.has-error').forEach(function (f) {
      f.classList.remove('has-error');
    });

    // Required inputs / selects
    step.querySelectorAll('[required]').forEach(function (input) {
      const field = input.closest('.form-field');
      const errorEl = field ? field.querySelector('.field-error') : null;

      let isEmpty = false;
      if (input.type === 'radio' || input.type === 'checkbox') {
        const group = step.querySelectorAll('[name="' + input.name + '"]');
        isEmpty = !Array.from(group).some(function (r) { return r.checked; });
      } else {
        isEmpty = !input.value.trim();
      }

      if (isEmpty) {
        valid = false;
        if (field) field.classList.add('has-error');
        if (errorEl) errorEl.textContent = 'This field is required.';
      } else if (input.type === 'email' && !isValidEmail(input.value)) {
        valid = false;
        if (field) field.classList.add('has-error');
        if (errorEl) errorEl.textContent = 'Please enter a valid email address.';
      }
    });

    return valid;
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  /* ─── Live error clearing ─────────────────────────────────────────────── */

  form.querySelectorAll('input, select, textarea').forEach(function (el) {
    el.addEventListener('input', function () {
      const field = el.closest('.form-field');
      if (field && field.classList.contains('has-error')) {
        if (el.value.trim()) field.classList.remove('has-error');
      }
    });
  });

  /* ─── Conditional flight section ─────────────────────────────────────── */

  const AIRPORT_SERVICES = ['airport-transfer'];

  function toggleFlightSection() {
    if (!serviceSelect || !flightSection) return;
    const val = serviceSelect.value;
    const show = AIRPORT_SERVICES.includes(val);
    flightSection.classList.toggle('is-visible', show);

    // Toggle required on flight fields
    flightSection.querySelectorAll('input, select').forEach(function (input) {
      if (show) {
        input.setAttribute('required', '');
      } else {
        input.removeAttribute('required');
        input.value = '';
      }
    });
  }

  if (serviceSelect) {
    serviceSelect.addEventListener('change', toggleFlightSection);
  }

  /* ─── Return journey toggle ──────────────────────────────────────────── */

  const returnToggle   = document.getElementById('return-journey');
  const returnFields   = document.getElementById('return-fields');

  if (returnToggle && returnFields) {
    returnToggle.addEventListener('change', function () {
      const show = returnToggle.value === 'yes';
      returnFields.style.display = show ? '' : 'none';
      returnFields.querySelectorAll('input').forEach(function (inp) {
        show ? inp.setAttribute('required', '') : inp.removeAttribute('required');
      });
    });
    returnFields.style.display = 'none';
  }

  /* ─── Submit ──────────────────────────────────────────────────────────── */

  function submitForm() {
    if (!validate(current)) return;

    const btn = steps[current].querySelector('[data-next]');
    if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }

    var formData = new FormData(form);
    var data = {};
    formData.forEach(function (value, key) {
      if (typeof value === 'string') data[key] = value;
    });

    fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (res) {
      if (res.ok) {
        window.location.href = 'thank-you.html';
      } else {
        if (btn) { btn.textContent = 'Submit Request'; btn.disabled = false; }
        alert('Something went wrong. Please try again or email us directly.');
      }
    }).catch(function () {
      if (btn) { btn.textContent = 'Submit Request'; btn.disabled = false; }
      alert('Something went wrong. Please try again or email us directly.');
    });
  }

  /* ─── Initialise first step ──────────────────────────────────────────── */

  steps[0].classList.add('is-active');
  if (dots[0]) dots[0].classList.add('step-dot--active');

})();

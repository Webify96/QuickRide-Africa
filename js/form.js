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
  const confirmation = document.getElementById('form-confirmation');
  const flightSection = document.getElementById('flight-section');
  const serviceSelect = document.getElementById('service-required');

  let current = 0;
  const TOTAL = steps.length;

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
  }

  function goBack(index) {
    steps[current].classList.remove('is-active');
    dots[current].classList.remove('step-dot--active', 'step-dot--done');

    current = index;

    steps[current].classList.add('is-active');
    dots[current].classList.remove('step-dot--done');
    dots[current].classList.add('step-dot--active');

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    form.style.display = 'none';
    if (confirmation) {
      confirmation.classList.add('is-visible');
      confirmation.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ─── Initialise first step ──────────────────────────────────────────── */

  steps[0].classList.add('is-active');
  if (dots[0]) dots[0].classList.add('step-dot--active');

})();

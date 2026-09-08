// ============================================
// Nrityaam site interactions
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  [initScrollProgress, initFaqAccordion, initTestimonialCarousel, initBookingModal, initInstagramExitIntent, initSocialProofToast].forEach((init) => {
    try {
      init();
    } catch (err) {
      console.error(`${init.name} failed to initialize:`, err);
    }
  });
});

/* ---------- Site-wide reading/scroll progress bar ---------- */
function initScrollProgress() {
  const bar = document.getElementById('page-scroll-progress');
  if (!bar) return;

  function update() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

/* ---------- Student results: sliding testimonial carousel ----------
   Videos beyond the first few load lazily as their card scrolls into view,
   rather than all at once — with 9 clips in the track, eagerly preloading
   every video on page load previously froze the tab.
*/
function initTestimonialCarousel() {
  const track = document.getElementById('testimonial-track');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  if (!track) return;

  const SCROLL_STEP = 280;
  prevBtn?.addEventListener('click', () => track.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' }));
  nextBtn?.addEventListener('click', () => track.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' }));

  // No native <video controls> here (no seek bar) — just a minimal custom
  // play/pause toggle, since the built-in scrubber was explicitly not wanted.
  track.querySelectorAll('.testimonial-card.has-video').forEach((card) => {
    const video = card.querySelector('video');
    const playBtn = card.querySelector('.tc-play-btn');
    if (!video || !playBtn) return;

    const toggle = () => {
      if (video.paused) video.play(); else video.pause();
    };
    playBtn.addEventListener('click', toggle);
    video.addEventListener('click', toggle);
    video.addEventListener('play', () => card.classList.add('playing'));
    video.addEventListener('pause', () => card.classList.remove('playing'));
    video.addEventListener('ended', () => card.classList.remove('playing'));
  });

  const lazyVideos = track.querySelectorAll('video[data-src]');
  if (!lazyVideos.length) return;

  if (!('IntersectionObserver' in window)) {
    lazyVideos.forEach((video) => { video.src = video.dataset.src; video.preload = 'metadata'; });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const video = entry.target;
      video.src = video.dataset.src;
      video.preload = 'metadata';
      delete video.dataset.src;
      observer.unobserve(video);
    });
  }, { root: track, rootMargin: '0px 400px' });

  lazyVideos.forEach((video) => observer.observe(video));
}

/* ---------- FAQ accordion ---------- */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach((item) => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach((i) => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ---------- Booking / application modal ----------
   Native application form with conditional fields, submitted via
   FormSubmit.co's AJAX endpoint (https://formsubmit.co) rather than a
   host-specific integration — this works identically on localhost and on
   Hostinger (or anywhere else) since it's a plain cross-origin API call,
   not something that needs server-side processing on this domain. No
   account or backend code needed.

   First submission to a new destination email requires a one-time opt-in:
   FormSubmit sends bhavanan.27@gmail.com a confirmation email the first
   time a submission is attempted, and every submission before that click
   is silently held rather than delivered. After activating, submissions
   are emailed there directly.
*/
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/bhavanan.27@gmail.com';
function initBookingModal() {
  const overlay = document.getElementById('booking-modal-overlay');
  const closeBtn = document.getElementById('booking-modal-close');
  const triggers = document.querySelectorAll('.book-call-trigger');
  const formView = document.getElementById('booking-form-view');
  const successView = document.getElementById('booking-success-view');
  const successCloseBtn = document.getElementById('booking-success-close');
  const form = document.getElementById('application-form');
  const step1 = document.getElementById('form-step-1');
  const step2 = document.getElementById('form-step-2');
  const nextBtn = document.getElementById('step1-next');
  const backBtn = document.getElementById('step2-back');
  const submitBtn = document.getElementById('step2-submit');
  const errorMsg = document.getElementById('form-error');
  const yesFields = document.getElementById('learnt-yes-fields');
  const noFields = document.getElementById('learnt-no-fields');
  const progressFills = form ? form.querySelectorAll('.form-progress-fill') : [];
  if (!overlay || !closeBtn || !form) return;

  // "reason" is a single logical field shared by both learnt_before branches —
  // counted once here regardless of which branch's textarea currently holds it.
  const REQUIRED_FIELD_NAMES = [
    'first_name', 'last_name', 'email', 'dob', 'state',
    'country', 'country_code', 'contact_number', 'learnt_before', 'reason',
  ];

  function updateProgress() {
    const filled = REQUIRED_FIELD_NAMES.filter((name) => {
      const field = form.elements[name];
      if (!field) return false;
      // form.elements[name] returns a RadioNodeList for ANY group of elements
      // sharing a name — not just actual radio buttons (e.g. the two "reason"
      // textareas). Only radios have a meaningful .checked; other field types
      // in the group are checked by value instead.
      if (field instanceof RadioNodeList) {
        return Array.from(field).some((el) => {
          if (el.disabled) return false;
          return el.type === 'radio' ? el.checked : el.value.trim() !== '';
        });
      }
      if (field.disabled) return false;
      return field.value.trim() !== '';
    }).length;
    const pct = `${Math.round((filled / REQUIRED_FIELD_NAMES.length) * 100)}%`;
    progressFills.forEach((fill) => { fill.style.width = pct; });
  }

  // Disabled fields are excluded from FormData automatically — needed here since
  // both branches share a "reason" field name, so only the visible one should submit.
  function setGroupActive(group, active) {
    group.classList.toggle('hidden', !active);
    group.querySelectorAll('input, textarea').forEach((el) => { el.disabled = !active; });
  }

  function goToStep1() {
    step2.classList.add('hidden');
    step1.classList.remove('hidden');
  }

  function goToStep2() {
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
  }

  function resetModal() {
    form.reset();
    setGroupActive(yesFields, false);
    setGroupActive(noFields, false);
    goToStep1();
    errorMsg.classList.add('hidden');
    successView.classList.add('hidden');
    formView.classList.remove('hidden');
    updateProgress();
  }

  function openModal() {
    overlay.classList.add('visible');
  }

  function closeModal() {
    overlay.classList.remove('visible');
    resetModal();
  }

  triggers.forEach((btn) => btn.addEventListener('click', openModal));
  closeBtn.addEventListener('click', closeModal);
  successCloseBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // form.reportValidity() checks every field regardless of visibility, so it can't
  // be used here — it would block on step 2's fields before the user ever sees them.
  // Scope validation to step 1's own fields instead.
  nextBtn.addEventListener('click', () => {
    const step1Fields = Array.from(step1.querySelectorAll('input, textarea, select'));
    const firstInvalid = step1Fields.find((field) => !field.checkValidity());
    if (firstInvalid) {
      firstInvalid.reportValidity();
      return;
    }
    goToStep2();
  });

  backBtn.addEventListener('click', goToStep1);

  form.querySelectorAll('input[name="learnt_before"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const showYes = radio.value === 'yes' && radio.checked;
      const showNo = radio.value === 'no' && radio.checked;
      if (showYes) {
        setGroupActive(yesFields, true);
        setGroupActive(noFields, false);
      } else if (showNo) {
        setGroupActive(noFields, true);
        setGroupActive(yesFields, false);
      }
    });
  });

  form.addEventListener('input', updateProgress);
  form.addEventListener('change', updateProgress);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    errorMsg.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    const data = Object.fromEntries(new FormData(form).entries());
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`FormSubmit responded ${res.status}`);
        formView.classList.add('hidden');
        successView.classList.remove('hidden');
      })
      .catch((err) => {
        console.error('Application submission failed:', err);
        errorMsg.classList.remove('hidden');
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      });
  });
}

/* ---------- Instagram exit-intent modal ----------
   Replace the href below with the real Instagram handle URL once provided.
*/
const INSTAGRAM_URL = 'https://www.instagram.com/ranbbir.dance?igsh=MWZic2MyMXlld2o0MA==';

function initInstagramExitIntent() {
  const overlay = document.getElementById('ig-modal-overlay');
  const closeBtn = document.getElementById('ig-modal-close');
  const link = document.getElementById('ig-modal-link');
  if (!overlay || !closeBtn || !link) return;

  link.href = INSTAGRAM_URL;

  let shown = false;

  document.addEventListener('mouseout', (e) => {
    if (shown) return;
    if (e.clientY <= 0 && !e.relatedTarget) {
      overlay.classList.add('visible');
      shown = true;
    }
  });

  // fallback for touch devices: show once after a delay
  setTimeout(() => {
    if (!shown) {
      overlay.classList.add('visible');
      shown = true;
    }
  }, 45000);

  closeBtn.addEventListener('click', () => overlay.classList.remove('visible'));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('visible');
  });
}

/* ---------- Rotating corner social-proof toast ----------
   Message content lives in js/message-popup.js (TESTIMONIAL_MESSAGES),
   loaded before this file — see index.html.
*/
function initSocialProofToast() {
  const toast = document.getElementById('social-toast');
  const nameEl = toast.querySelector('.toast-name');
  const msgEl = toast.querySelector('.toast-msg');
  const avatarEl = toast.querySelector('.toast-avatar');
  if (typeof TESTIMONIAL_MESSAGES === 'undefined' || !TESTIMONIAL_MESSAGES.length) return;

  let index = 0;

  // Clears the sticky nav header (~90px) and stays clear of the bottom edge,
  // so the toast lands somewhere within whatever section is currently in view.
  const HEADER_CLEARANCE = 100;
  const BOTTOM_CLEARANCE = 140;

  function positionRandomly() {
    const maxTop = Math.max(HEADER_CLEARANCE, window.innerHeight - BOTTOM_CLEARANCE);
    const top = Math.round(HEADER_CLEARANCE + Math.random() * (maxTop - HEADER_CLEARANCE));
    toast.style.top = `${top}px`;
    return top;
  }

  // Samples the element the toast is about to land on (using the resting
  // top/left, not the current translated-offscreen position) so text stays
  // legible whether it lands on a light or dark ("on-dark") section.
  function updateContrastForBackground(top) {
    const left = parseFloat(getComputedStyle(toast).left) || 24;
    const el = document.elementFromPoint(left + 20, top + 20);
    const isDark = !!(el && el.closest('.on-dark'));
    toast.classList.toggle('on-dark-bg', isDark);
  }

  function showNext() {
    const item = TESTIMONIAL_MESSAGES[index % TESTIMONIAL_MESSAGES.length];
    nameEl.textContent = item.name;
    msgEl.textContent = `"${item.msg}"`;
    avatarEl.textContent = item.name.charAt(0).toUpperCase();

    const top = positionRandomly();
    updateContrastForBackground(top);
    toast.classList.add('visible');
    index++;

    setTimeout(() => toast.classList.remove('visible'), 5000);
  }

  setTimeout(showNext, 1200);
  setInterval(showNext, 13000);
}


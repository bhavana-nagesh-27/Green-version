// ============================================
// Nrityaam site interactions
// ============================================

// Shared by any modal: keeps the page behind a modal from scrolling while
// it's open, without fighting a second modal that might also be open.
let scrollLockCount = 0;
function lockBodyScroll() {
  scrollLockCount++;
  document.body.classList.add('no-scroll');
}
function unlockBodyScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) document.body.classList.remove('no-scroll');
}

document.addEventListener('DOMContentLoaded', () => {
  [initScrollProgress, initMobileNav, initFaqAccordion, initTestimonialCarousel, initBookingModal, initInstagramExitIntent].forEach((init) => {
    try {
      init();
    } catch (err) {
      console.error(`${init.name} failed to initialize:`, err);
    }
  });
});

/* ---------- Mobile hamburger nav ---------- */
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;

  function closeMenu() {
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('click', (e) => {
    if (!links.classList.contains('open')) return;
    if (links.contains(e.target) || toggle.contains(e.target)) return;
    closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeMenu();
  });
}

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
  const allVideos = [];
  track.querySelectorAll('.testimonial-card.has-video').forEach((card) => {
    const video = card.querySelector('video');
    const playBtn = card.querySelector('.tc-play-btn');
    if (!video || !playBtn) return;
    allVideos.push(video);

    const toggle = () => {
      if (video.paused) video.play(); else video.pause();
    };
    playBtn.addEventListener('click', toggle);
    video.addEventListener('click', toggle);
    // Only one testimonial should ever play at a time.
    video.addEventListener('play', () => {
      allVideos.forEach((other) => { if (other !== video && !other.paused) other.pause(); });
      card.classList.add('playing');
    });
    video.addEventListener('pause', () => card.classList.remove('playing'));
    video.addEventListener('ended', () => card.classList.remove('playing'));
  });

  // Pause a playing video once it's mostly scrolled out of view — covers both
  // vertical page scroll (root: viewport) and the carousel's own horizontal
  // scroll, since either changes an element's viewport intersection.
  if (allVideos.length && 'IntersectionObserver' in window) {
    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio < 0.3 && !entry.target.paused) entry.target.pause();
      });
    }, { threshold: 0.3 });
    allVideos.forEach((video) => visibilityObserver.observe(video));
  }

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
   FormSubmit sends students@ranbbirbanerjee.com a confirmation email the
   first time a submission is attempted, and every submission before that
   click is silently held rather than delivered. After activating,
   submissions are emailed there directly.

   Submitted as multipart/form-data (via FormData) rather than JSON so a
   client-built CSV of the answers can ride along as a real file attachment
   — FormSubmit forwards any file-valued field in a multipart POST to its
   AJAX endpoint the same way it does for a plain <input type="file">,
   regardless of whether the value came from user-picked file or a
   synthesized Blob; the request is indistinguishable at the HTTP level.
*/
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/students@ranbbirbanerjee.com';
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
  const dobField = document.getElementById('f-dob');
  const contactField = document.getElementById('f-contact');
  const emailField = document.getElementById('f-email');
  const yearsField = document.getElementById('f-years');
  const lettersOnlyFields = ['f-first-name', 'f-last-name', 'f-state', 'f-country']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!overlay || !closeBtn || !form) return;

  // Auto-insert the dd.mm.yyyy separators as the user types digits.
  dobField?.addEventListener('input', () => {
    const digits = dobField.value.replace(/\D/g, '').slice(0, 8);
    let formatted = digits.slice(0, 2);
    if (digits.length > 2) formatted += `.${digits.slice(2, 4)}`;
    if (digits.length > 4) formatted += `.${digits.slice(4, 8)}`;
    dobField.value = formatted;
  });

  // Strip anything but a leading "+" and digits as the user types.
  contactField?.addEventListener('input', () => {
    const hasPlus = contactField.value.trim().startsWith('+');
    const digits = contactField.value.replace(/\D/g, '');
    contactField.value = (hasPlus ? '+' : '') + digits;
  });

  // Block anything but letters and spaces from ever appearing.
  lettersOnlyFields.forEach((field) => {
    field.addEventListener('input', () => {
      field.value = field.value.replace(/[^A-Za-z ]/g, '');
    });
  });

  // Years of experience: digits only.
  yearsField?.addEventListener('input', () => {
    yearsField.value = yearsField.value.replace(/\D/g, '');
  });

  // Email addresses can't contain whitespace.
  emailField?.addEventListener('input', () => {
    emailField.value = emailField.value.replace(/\s/g, '');
  });

  // "reason" is a single logical field shared by both learnt_before branches —
  // counted once here regardless of which branch's textarea currently holds it.
  const BASE_REQUIRED_FIELD_NAMES = [
    'first_name', 'last_name', 'email', 'dob', 'state',
    'country', 'contact_number', 'learnt_before', 'reason',
  ];
  // Guru/lessons/years are only required (and only rendered/enabled) when the
  // "Yes" branch is active — excluded from the denominator otherwise, so the
  // "No" branch can still reach 100%.
  const YES_BRANCH_REQUIRED_FIELD_NAMES = ['guru', 'lessons_learnt', 'years_experience'];

  function updateProgress() {
    const yesActive = !yesFields.classList.contains('hidden');
    const activeNames = yesActive
      ? [...BASE_REQUIRED_FIELD_NAMES, ...YES_BRANCH_REQUIRED_FIELD_NAMES]
      : BASE_REQUIRED_FIELD_NAMES;

    const filled = activeNames.filter((name) => {
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
    const pct = `${Math.round((filled / activeNames.length) * 100)}%`;
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
    lockBodyScroll();
  }

  function closeModal() {
    overlay.classList.remove('visible');
    unlockBodyScroll();
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

  // Builds a one-row CSV of the submitted answers so the application arrives
  // as a structured attachment, not just inline text/JSON. Columns are fixed
  // (rather than derived from whatever keys happen to be in `data`) so the
  // header is stable and readable regardless of which learnt_before branch
  // was active; columns whose field wasn't part of this submission (e.g.
  // guru/lessons_learnt/years_experience on the "No" branch) are simply
  // left blank rather than omitted, so every export has the same shape.
  const CSV_COLUMNS = [
    'first_name', 'last_name', 'email', 'dob', 'state', 'country',
    'contact_number', 'instagram_id', 'learnt_before', 'guru',
    'lessons_learnt', 'years_experience', 'reason',
  ];
  function escapeCsvValue(value) {
    const str = String(value ?? '');
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  }
  function buildApplicationCsv(data) {
    const header = CSV_COLUMNS.join(',');
    const row = CSV_COLUMNS.map((name) => escapeCsvValue(data[name])).join(',');
    return `${header}\n${row}\n`;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    errorMsg.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    const data = Object.fromEntries(new FormData(form).entries());

    // Sent as FormData (multipart/form-data), not JSON, so the CSV blob below
    // can travel as a real file attachment — no Content-Type header is set
    // manually so the browser fills in the multipart boundary itself.
    const payload = new FormData();
    payload.append('attachment', new Blob([buildApplicationCsv(data)], { type: 'text/csv' }), 'application.csv');
    Object.entries(data).forEach(([key, value]) => payload.append(key, value));

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: payload,
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

  function openIgModal() {
    overlay.classList.add('visible');
    lockBodyScroll();
    shown = true;
  }

  function closeIgModal() {
    overlay.classList.remove('visible');
    unlockBodyScroll();
  }

  document.addEventListener('mouseout', (e) => {
    if (shown) return;
    if (e.clientY <= 0 && !e.relatedTarget) openIgModal();
  });

  // fallback for touch devices: show once after a delay
  setTimeout(() => {
    if (!shown) openIgModal();
  }, 45000);

  closeBtn.addEventListener('click', closeIgModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeIgModal();
  });
}


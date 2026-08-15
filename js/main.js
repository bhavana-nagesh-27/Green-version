// ============================================
// Nrityaam site interactions
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  [initFaqAccordion, initBookingModal, initInstagramExitIntent, initSocialProofToast].forEach((init) => {
    try {
      init();
    } catch (err) {
      console.error(`${init.name} failed to initialize:`, err);
    }
  });
});

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
   Native application form with conditional fields. There is no backend wired
   up yet — on submit, the collected data is only logged to the console and
   the success message is shown. Replace the TODO inside the submit handler
   below with a real fetch() call (Formspree, Google Sheets webhook, etc.)
   once a submission endpoint exists, so applications actually reach the team.
*/
function initBookingModal() {
  const overlay = document.getElementById('booking-modal-overlay');
  const closeBtn = document.getElementById('booking-modal-close');
  const triggers = document.querySelectorAll('.book-call-trigger');
  const formView = document.getElementById('booking-form-view');
  const successView = document.getElementById('booking-success-view');
  const successCloseBtn = document.getElementById('booking-success-close');
  const form = document.getElementById('application-form');
  const yesFields = document.getElementById('learnt-yes-fields');
  const noFields = document.getElementById('learnt-no-fields');
  if (!overlay || !closeBtn || !form) return;

  // Disabled fields are excluded from FormData automatically — needed here since
  // both branches share a "reason" field name, so only the visible one should submit.
  function setGroupActive(group, active) {
    group.classList.toggle('hidden', !active);
    group.querySelectorAll('input, textarea').forEach((el) => { el.disabled = !active; });
  }

  function resetModal() {
    form.reset();
    setGroupActive(yesFields, false);
    setGroupActive(noFields, false);
    successView.classList.add('hidden');
    formView.classList.remove('hidden');
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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form).entries());
    // TODO: send `data` to a real backend once a submission endpoint exists.
    console.log('Application submitted (not yet wired to a backend):', data);

    formView.classList.add('hidden');
    successView.classList.remove('hidden');
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
   Replace with real testimonial snippets (name, message, country) once available.
*/
const SOCIAL_PROOF_ITEMS = [
  { name: 'A. Sharma', msg: 'Just booked a call with Nrityaam!', loc: 'India', initial: 'A' },
  { name: 'M. Chen', msg: 'Enrolled in the Bharatanatyam program', loc: 'Singapore', initial: 'M' },
  { name: 'J. Smith', msg: 'Started their structured training journey', loc: 'USA', initial: 'J' },
  { name: 'L. Muller', msg: 'Joined the Nrityaam community', loc: 'Germany', initial: 'L' },
];

function initSocialProofToast() {
  const toast = document.getElementById('social-toast');
  const nameEl = toast.querySelector('.toast-name');
  const msgEl = toast.querySelector('.toast-msg');
  const locEl = toast.querySelector('.toast-loc');
  const avatarEl = toast.querySelector('.toast-avatar');

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
    const item = SOCIAL_PROOF_ITEMS[index % SOCIAL_PROOF_ITEMS.length];
    nameEl.textContent = item.name;
    msgEl.textContent = `"${item.msg}"`;
    locEl.textContent = item.loc;
    avatarEl.textContent = item.initial;

    const top = positionRandomly();
    updateContrastForBackground(top);
    toast.classList.add('visible');
    index++;

    setTimeout(() => toast.classList.remove('visible'), 5000);
  }

  setTimeout(showNext, 1200);
  setInterval(showNext, 13000);
}


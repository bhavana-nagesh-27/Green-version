// ============================================
// Nrityaam site interactions
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initFaqAccordion();
  initCarousel();
  initTallyModal();
  initInstagramExitIntent();
  initSocialProofToast();
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

/* ---------- Before/after carousel ---------- */
function initCarousel() {
  const track = document.getElementById('ba-carousel');
  const prev = document.getElementById('ba-prev');
  const next = document.getElementById('ba-next');
  if (!track) return;

  const scrollAmount = 280;
  prev.addEventListener('click', () => track.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
}

/* ---------- Tally booking modal ----------
   Replace TALLY_FORM_ID below with your real Tally form ID once created,
   e.g. "https://tally.so/embed/XXXXXX" — until then the modal shows a placeholder.
*/
const TALLY_FORM_ID = null; // e.g. "abc123"

function initTallyModal() {
  const overlay = document.getElementById('tally-modal-overlay');
  const closeBtn = document.getElementById('tally-modal-close');
  const placeholder = document.getElementById('tally-placeholder');
  const triggers = document.querySelectorAll('.book-call-trigger');

  triggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      overlay.classList.add('visible');

      if (TALLY_FORM_ID && !overlay.querySelector('iframe')) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://tally.so/embed/${TALLY_FORM_ID}?alignLeft=1&hideTitle=1&transparentBackground=1`;
        overlay.querySelector('.modal-box').appendChild(iframe);
        placeholder.style.display = 'none';
      }
    });
  });

  closeBtn.addEventListener('click', () => overlay.classList.remove('visible'));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('visible');
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

  function showNext() {
    const item = SOCIAL_PROOF_ITEMS[index % SOCIAL_PROOF_ITEMS.length];
    nameEl.textContent = item.name;
    msgEl.textContent = `"${item.msg}"`;
    locEl.textContent = item.loc;
    avatarEl.textContent = item.initial;

    toast.classList.add('visible');
    index++;

    setTimeout(() => toast.classList.remove('visible'), 5000);
  }

  setTimeout(showNext, 1200);
  setInterval(showNext, 13000);
}


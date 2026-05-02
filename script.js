/* ============================================================
   Password Strength Checker — script.js
   Author: [Your Name]
   ============================================================ */

/* ---------- DOM references ---------- */
const pwInput      = document.getElementById('pw');
const barFill      = document.getElementById('barFill');
const strengthLabel = document.getElementById('strengthLabel');
const crackTime    = document.getElementById('crackTime');
const entropyVal   = document.getElementById('entropyVal');
const toggleBtn    = document.getElementById('toggleBtn');
const eyeIcon      = document.getElementById('eyeIcon');

/* ---------- Criteria elements ---------- */
const CRITERIA = {
  length:  { el: document.getElementById('c-length'),  test: p => p.length >= 8 },
  upper:   { el: document.getElementById('c-upper'),   test: p => /[A-Z]/.test(p) },
  lower:   { el: document.getElementById('c-lower'),   test: p => /[a-z]/.test(p) },
  number:  { el: document.getElementById('c-number'),  test: p => /[0-9]/.test(p) },
  special: { el: document.getElementById('c-special'), test: p => /[^A-Za-z0-9]/.test(p) },
  long:    { el: document.getElementById('c-long'),    test: p => p.length >= 16 },
};

/* ---------- Strength levels ---------- */
const LEVELS = [
  { label: '✗ Too weak',    color: '#f87171', pct: 12  }, // red
  { label: '⚠ Weak',        color: '#fb923c', pct: 30  }, // orange
  { label: '▲ Fair',        color: '#facc15', pct: 55  }, // yellow
  { label: '🔒 Strong',     color: '#22d3ee', pct: 78  }, // cyan
  { label: '🛡 Very strong', color: '#4ade80', pct: 100 }, // green
];

/* ---------- Entropy calculation ----------
   Measures how many bits of randomness a password has,
   based on the size of the character pool it draws from. */
function calcEntropy(pw) {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 32;
  return pool > 0 ? Math.round(pw.length * Math.log2(pool)) : 0;
}

/* ---------- Crack-time estimate ----------
   Assumes an offline attack at 1 trillion guesses/second (fast GPU hash).
   Formula: guesses = 2^entropy, time = guesses / guesses_per_second */
function crackTimeStr(entropy) {
  const guesses = Math.pow(2, entropy);
  const gps = 1e12; // 1 trillion guesses/sec
  const secs = guesses / gps;
  if (secs < 1)          return 'instantly';
  if (secs < 60)         return `${Math.round(secs)}s`;
  if (secs < 3600)       return `${Math.round(secs / 60)}m`;
  if (secs < 86400)      return `${Math.round(secs / 3600)}h`;
  if (secs < 31536000)   return `${Math.round(secs / 86400)} days`;
  if (secs < 3.15e9)     return `${Math.round(secs / 31536000)} yrs`;
  if (secs < 3.15e12)    return `${(secs / 3.15e9).toFixed(0)}k yrs`;
  return 'centuries+';
}

/* ---------- Strength score (0–4) ---------- */
function scorePassword(pw) {
  if (!pw) return -1;
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (pw.length >= 16) s++;
  if (/[A-Z]/.test(pw))          s++;
  if (/[a-z]/.test(pw))          s++;
  if (/[0-9]/.test(pw))          s++;
  if (/[^A-Za-z0-9]/.test(pw))   s++;
  if (s <= 1) return 0;
  if (s <= 3) return 1;
  if (s <= 4) return 2;
  if (s <= 6) return 3;
  return 4;
}

/* ---------- Main update function ---------- */
function updateUI() {
  const pw = pwInput.value;

  /* — Criteria badges — */
  Object.values(CRITERIA).forEach(({ el, test }) => {
    const met = pw.length > 0 && test(pw);
    el.classList.toggle('met', met);
    el.classList.toggle('unmet', !met);
  });

  /* — Entropy — */
  const entropy = calcEntropy(pw);
  entropyVal.textContent = pw.length ? `${entropy} bits` : '— bits';

  /* — Score & bar — */
  const score = scorePassword(pw);

  if (score === -1) {
    // Empty input — reset
    barFill.style.width = '0%';
    barFill.style.background = '#22d3ee';
    strengthLabel.textContent = 'Waiting for input...';
    strengthLabel.style.color = '#64748b';
    crackTime.innerHTML = '';
    return;
  }

  const level = LEVELS[score];
  barFill.style.width = level.pct + '%';
  barFill.style.background = level.color;
  strengthLabel.textContent = level.label;
  strengthLabel.style.color = level.color;

  /* — Crack time — */
  crackTime.innerHTML = `crack: <span class="ct-val">${crackTimeStr(entropy)}</span>`;
}

/* ---------- Eye toggle (show/hide password) ---------- */
let isVisible = false;

function setEyeIcon(show) {
  // Swap between open-eye and crossed-eye SVG paths
  if (show) {
    eyeIcon.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8
        a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8
        a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    `;
  } else {
    eyeIcon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    `;
  }
}

toggleBtn.addEventListener('click', () => {
  isVisible = !isVisible;
  pwInput.type = isVisible ? 'text' : 'password';
  setEyeIcon(isVisible);
});

/* ---------- Input listener ---------- */
pwInput.addEventListener('input', updateUI);

/* ---------- Initialise ---------- */
updateUI();

/* ================================================================
   HomePilot AI — script.js  (Full Production)
   ================================================================ */

'use strict';

/* ────────────────────────────────────────
   1. CUSTOM CURSOR
──────────────────────────────────────── */
const cursor      = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');

if (window.matchMedia('(pointer:fine)').matches) {
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left      = mx + 'px';
    cursor.style.top       = my + 'px';
    cursorTrail.style.left = mx + 'px';
    cursorTrail.style.top  = my + 'px';
  });
  document.querySelectorAll('a,button,.dc-btn,.val-btn,.or-btn,.faq-q,.pc-btn,.map-pin').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.style.transform = 'translate(-50%,-50%) scale(2.5)'; });
    el.addEventListener('mouseleave', () => { cursor.style.transform = 'translate(-50%,-50%) scale(1)'; });
  });
}

/* ────────────────────────────────────────
   2. HERO CANVAS — particle field
──────────────────────────────────────── */
(function heroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - .5) * .35;
      this.vy = (Math.random() - .5) * .35;
      this.r  = Math.random() * 1.8 + .4;
      this.a  = Math.random() * .5 + .1;
      this.gold = Math.random() < .25;
    }
    update() {
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 120) { this.vx += dx / dist * .04; this.vy += dy / dist * .04; }
      this.vx *= .995; this.vy *= .995;
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.gold
        ? `rgba(232,201,109,${this.a})`
        : `rgba(139,144,176,${this.a * .6})`;
      ctx.fill();
    }
  }

  const COUNT = Math.min(120, Math.floor(W * H / 12000));
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  // draw connections
  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 90) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(232,201,109,${(1 - d/90) * .08})`;
          ctx.lineWidth   = .6;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ────────────────────────────────────────
   3. CTA CANVAS — gold ring burst
──────────────────────────────────────── */
(function ctaCanvas() {
  const canvas = document.getElementById('ctaCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  let t = 0;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;
    for (let i = 0; i < 4; i++) {
      const r = 80 + i * 90 + (Math.sin(t * .5 + i) * 20);
      const alpha = (.08 - i * .018) * (0.5 + 0.5 * Math.sin(t * .3 + i));
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(232,201,109,${Math.max(0, alpha)})`;
      ctx.lineWidth   = 1;
      ctx.stroke();
    }
    t += 0.025;
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ────────────────────────────────────────
   4. NAV — scroll + hamburger + active highlight
──────────────────────────────────────── */
const nav     = document.getElementById('nav');
const burger  = document.getElementById('burger');
const mobileNav = document.getElementById('mobileNav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  mobileNav.classList.toggle('open');
});
mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    mobileNav.classList.remove('open');
  });
});

// active nav link on scroll
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const secObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => secObserver.observe(s));

/* ────────────────────────────────────────
   5. SCROLL REVEAL
──────────────────────────────────────── */
const revealEls = document.querySelectorAll(
  '.step-card,.bento-card,.testi-card,.price-card,.faq-item,.val-card,.ai-split-text,.ai-advantages li,.offer-row,.offer-net-summary'
);
revealEls.forEach(el => el.classList.add('reveal'));

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = [...(entry.target.parentElement?.children || [])];
    const idx = siblings.indexOf(entry.target);
    entry.target.style.transitionDelay = Math.min(idx * 70, 400) + 'ms';
    entry.target.classList.add('in');
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObs.observe(el));

/* ────────────────────────────────────────
   6. COUNTER ANIMATION (hero trust stats)
──────────────────────────────────────── */
function countUp(el, target, prefix, suffix, dur = 1800) {
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.floor(eased * target);
    el.textContent = prefix + val.toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = prefix + target.toLocaleString() + suffix;
  };
  requestAnimationFrame(step);
}

const trustNums = document.querySelectorAll('.trust-num');
const trustObs = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting) return;
  trustNums.forEach(el => {
    countUp(el,
      +el.dataset.count,
      el.dataset.prefix,
      el.dataset.suffix
    );
  });
  trustObs.disconnect();
}, { threshold: 0.5 });

const trustWrap = document.querySelector('.hero-trust');
if (trustWrap) trustObs.observe(trustWrap);

/* ────────────────────────────────────────
   7. PROGRESS / CONF BAR ANIMATE ON SCROLL
──────────────────────────────────────── */
function animBar(id, width, delay = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.width = '0';
  el.style.transition = `width 1.5s ${delay}ms cubic-bezier(0.22,1,0.36,1)`;
  const obs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    setTimeout(() => { el.style.width = width; }, 100);
    obs.disconnect();
  }, { threshold: 0.5 });
  obs.observe(el.closest('section') || el.parentElement);
}
animBar('progressFill', '72%', 400);
animBar('valConfFill',  '88%', 500);

/* ────────────────────────────────────────
   8. DASHBOARD — live view counter & 3rd offer pop
──────────────────────────────────────── */
const viewCountEl = document.getElementById('viewCount');
let viewCount = 247;
setInterval(() => {
  if (Math.random() < .4) {
    viewCount += Math.floor(Math.random() * 3) + 1;
    if (viewCountEl) {
      viewCountEl.textContent = viewCount;
      viewCountEl.style.color = 'var(--gold)';
      setTimeout(() => viewCountEl.style.color = '', 600);
    }
  }
}, 3000);

// pop in 3rd offer after 5s
setTimeout(() => {
  const o3 = document.getElementById('offer3');
  const badge = document.getElementById('offerBadge');
  if (o3) {
    o3.style.display = 'flex';
    o3.style.animation = 'fadeUp .5s ease both';
  }
  if (badge) badge.textContent = '3 New';
}, 5000);

/* ────────────────────────────────────────
   9. DASHBOARD TILT (desktop)
──────────────────────────────────────── */
const dashCard = document.getElementById('dashCard');
if (dashCard && window.matchMedia('(pointer:fine)').matches) {
  dashCard.addEventListener('mousemove', e => {
    const r  = dashCard.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2)  / (r.width / 2);
    const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    dashCard.style.transition = 'transform .08s ease';
    dashCard.style.transform  = `perspective(800px) rotateY(${dx * 7}deg) rotateX(${-dy * 4}deg) scale(1.02)`;
  });
  dashCard.addEventListener('mouseleave', () => {
    dashCard.style.transition = 'transform .5s ease';
    dashCard.style.transform  = '';
  });
}

/* ────────────────────────────────────────
   10. FLOATING CHIPS — auto-cycle
──────────────────────────────────────── */
const chips = document.querySelectorAll('.chip');
const chipData = [
  ['🤖', 'AI wrote your listing!'],
  ['💰', 'Save $22K in fees'],
  ['🔔', '3 buyer matches'],
  ['📊', '5 offers received!'],
  ['⚡', 'Listed in 10 min'],
  ['✅', 'Offer accepted!'],
  ['🏡', 'Sold in 11 days'],
];
let chipIdx = chipData.length;

setInterval(() => {
  if (!chips.length) return;
  const chip = chips[Math.floor(Math.random() * chips.length)];
  const [icon, text] = chipData[chipIdx++ % chipData.length];
  chip.style.opacity  = '0';
  chip.style.transform = (chip.style.transform || '') + ' scale(.85)';
  chip.style.transition = 'opacity .3s,transform .3s';
  setTimeout(() => {
    chip.innerHTML  = `<span>${icon}</span> ${text}`;
    chip.style.opacity   = '1';
    chip.style.transform = chip.style.transform.replace(' scale(.85)', '');
  }, 320);
}, 3200);

/* ────────────────────────────────────────
   11. AI TYPING EFFECT
──────────────────────────────────────── */
const typingEl = document.getElementById('aiTyping');
if (typingEl) {
  const full = typingEl.textContent;
  typingEl.textContent = '';
  let typed = false;

  const typeObs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || typed) return;
    typed = true;
    let i = 0;
    const interval = setInterval(() => {
      typingEl.textContent = full.slice(0, i++);
      if (i > full.length) clearInterval(interval);
    }, 22);
    typeObs.disconnect();
  }, { threshold: 0.5 });
  typeObs.observe(typingEl);
}

/* ────────────────────────────────────────
   12. FAQ ACCORDION
──────────────────────────────────────── */
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ────────────────────────────────────────
   13. CTA FORM
──────────────────────────────────────── */
const ctaSubmit  = document.getElementById('ctaSubmit');
const ctaAddress = document.getElementById('ctaAddress');

if (ctaSubmit && ctaAddress) {
  ctaSubmit.addEventListener('click', handleCta);
  ctaAddress.addEventListener('keydown', e => { if (e.key === 'Enter') handleCta(); });

  function handleCta() {
    const val = ctaAddress.value.trim();
    if (!val) {
      ctaAddress.style.animation = 'none';
      void ctaAddress.offsetWidth;
      ctaAddress.style.animation = 'shake .4s ease';
      ctaAddress.focus();
      return;
    }
    ctaSubmit.textContent = '⟳ Analyzing...';
    ctaSubmit.disabled    = true;
    ctaSubmit.style.opacity = '.75';

    setTimeout(() => {
      ctaSubmit.textContent    = '✓ Report Ready — Check Your Email!';
      ctaSubmit.style.background = '#4ade80';
      ctaSubmit.style.opacity  = '1';
      ctaSubmit.disabled       = false;
      ctaAddress.value         = '';
    }, 2400);
  }
}

/* ────────────────────────────────────────
   14. INJECT EXTRA KEYFRAMES
──────────────────────────────────────── */
const extraStyles = document.createElement('style');
extraStyles.textContent = `
  @keyframes shake {
    0%,100%{transform:translateX(0)}
    20%{transform:translateX(-8px)}
    40%{transform:translateX(8px)}
    60%{transform:translateX(-6px)}
    80%{transform:translateX(6px)}
  }
`;
document.head.appendChild(extraStyles);

/* ────────────────────────────────────────
   15. OFFER ROW — highlight net on hover
──────────────────────────────────────── */
document.querySelectorAll('.offer-row').forEach(row => {
  row.addEventListener('mouseenter', () => {
    const net = row.querySelector('.or-net');
    if (net) { net.style.transform = 'scale(1.08)'; net.style.transition = 'transform .2s'; }
  });
  row.addEventListener('mouseleave', () => {
    const net = row.querySelector('.or-net');
    if (net) net.style.transform = '';
  });
});

/* ────────────────────────────────────────
   16. MINI STAT BARS (bento) ANIMATE
──────────────────────────────────────── */
const bentoObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.bmini-bar > div').forEach(bar => {
      const w = bar.style.width;
      bar.style.width = '0';
      bar.style.transition = 'width 1.2s cubic-bezier(0.22,1,0.36,1)';
      setTimeout(() => { bar.style.width = w; }, 200);
    });
    bentoObs.unobserve(entry.target);
  });
}, { threshold: 0.3 });

document.querySelectorAll('.bento-wide').forEach(el => bentoObs.observe(el));

/* ────────────────────────────────────────
   17. MARQUEE — pause on hover
──────────────────────────────────────── */
const track = document.querySelector('.marquee-track');
if (track) {
  track.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
  track.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
}

/* ────────────────────────────────────────
   18. SMOOTH SCROLL for all anchors
──────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});

/* ────────────────────────────────────────
   19. PAGE LOAD FADE-IN STAGGER
──────────────────────────────────────── */
document.querySelectorAll('.hero-content > *').forEach((el, i) => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity .7s ${i * 100}ms ease, transform .7s ${i * 100}ms ease`;
  requestAnimationFrame(() => {
    setTimeout(() => {
      el.style.opacity   = '1';
      el.style.transform = 'none';
    }, 80);
  });
});

/* ────────────────────────────────────────
   20. CONSOLE BRAND
──────────────────────────────────────── */
console.log('%c🏡 HomePilot AI', 'font-size:22px;font-weight:bold;color:#e8c96d;background:#07080d;padding:8px 16px;border-radius:8px;');
console.log('%cSell Direct. Keep the Commission.', 'color:#8b90b0;font-size:13px;');
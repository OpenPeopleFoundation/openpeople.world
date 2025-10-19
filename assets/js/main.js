// Open People — SpaceX vibe micro-interactions
(() => {
  // Smooth scroll for in-page links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, "", `#${id}`);
      }
    });
  });

  // Reveal on scroll
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  els.forEach(el => io.observe(el));

  // Active nav underline based on section in view
  const navLinks = [...document.querySelectorAll('a[data-nav]')];
  const sections = navLinks
    .map(l => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  const activeIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = `#${entry.target.id}`;
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
    });
  }, { threshold: 0.5 });
  sections.forEach(s => activeIO.observe(s));

  // Click ripple for interactive cards
  document.querySelectorAll('.interactive').forEach(card => {
    card.addEventListener('click', (ev) => {
      const r = document.createElement('span');
      r.className = 'ripple';
      const rect = card.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.width = r.style.height = `${size}px`;
      r.style.left = `${ev.clientX - rect.left - size/2}px`;
      r.style.top = `${ev.clientY - rect.top - size/2}px`;
      card.appendChild(r);
      setTimeout(() => r.remove(), 600);
    });
  });

  // Inject ripple styles
  const s = document.createElement('style');
  s.textContent = `
  .interactive{overflow:hidden}
  .interactive .ripple{
    position:absolute;border-radius:50%;transform:scale(0);
    background:radial-gradient(circle, rgba(255,90,0,.35) 0%, rgba(255,90,0,0) 60%);
    animation:rip .6s ease-out forwards; pointer-events:none;
  }
  @keyframes rip { to { transform:scale(1); opacity:0; } }
  `;
  document.head.appendChild(s);
})();

// Launch telemetry progress bar
(() => {
  const bar = document.createElement('div');
  bar.className = 'progress';
  document.body.appendChild(bar);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const set = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
    bar.style.transform = `scaleX(${p})`;
  };

  // Update on scroll/resize, and once on load
  window.addEventListener('scroll', set, { passive: true });
  window.addEventListener('resize', set);
  set();

  if (reduceMotion) {
    bar.style.transition = 'none';
  }
})();

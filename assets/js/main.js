// Subtle interactions: reveal-on-scroll, hover ripple, accessibility niceties
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    document.querySelectorAll('animate').forEach(el => {
      const parent = el.parentNode;
      if (parent) {
        parent.removeChild(el);
      }
    });
  }

  // Reveal on scroll
  const els = document.querySelectorAll('.reveal');
  if (!prefersReduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => el.classList.add('is-visible'));
  }

  // Click ripple for interactive cards
  if (!prefersReduced) {
    document.querySelectorAll('.interactive').forEach(card => {
      card.addEventListener('click', (ev) => {
        const r = document.createElement('span');
        r.className = 'ripple';
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        r.style.width = r.style.height = `${size}px`;
        r.style.left = `${ev.clientX - rect.left - size / 2}px`;
        r.style.top = `${ev.clientY - rect.top - size / 2}px`;
        card.appendChild(r);
        setTimeout(() => r.remove(), 600);
      });
    });
  }

  // Inject ripple styles (keeps CSS clean)
  if (!prefersReduced) {
    const s = document.createElement('style');
    s.textContent = `
    .interactive{position:relative;overflow:hidden}
    .interactive .ripple{
      position:absolute;border-radius:50%;transform:scale(0);
      background:radial-gradient(circle, rgba(255,90,0,.35) 0%, rgba(255,90,0,0) 60%);
      animation:rip .6s ease-out forwards; pointer-events:none;
    }
    @keyframes rip { to { transform:scale(1); opacity:0; } }
    `;
    document.head.appendChild(s);
  }
})();

// Open People — experience choreography
(() => {
  // Smooth scroll for same-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const id = link.getAttribute('href')?.substring(1);
      if (!id) return;
      const section = document.getElementById(id);
      if (!section) return;
      event.preventDefault();
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', `#${id}`);
    });
  });

  // Reveal animation observer
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
    );
    revealEls.forEach(el => io.observe(el));
  }

  // Active nav state
  const navLinks = Array.from(document.querySelectorAll('a[data-nav]'));
  if (navLinks.length) {
    const sections = navLinks
      .map(link => document.querySelector(link.getAttribute('href') || ''))
      .filter(Boolean);

    const navObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const id = `#${entry.target.id}`;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === id);
          });
        });
      },
      { threshold: 0.55 }
    );

    sections.forEach(section => navObserver.observe(section));
  }

  // Progress bar
  const progress = document.createElement('div');
  progress.className = 'progress';
  document.body.appendChild(progress);

  const updateProgress = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const value = max > 0 ? (doc.scrollTop || document.body.scrollTop) / max : 0;
    progress.style.transform = `scaleX(${value})`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    progress.style.transition = 'none';
  }

  // Mobile navigation
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.getElementById('mobile-nav');
  if (toggle && drawer) {
    let closeTimer;

    const openNav = () => {
      drawer.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        drawer.classList.add('is-open');
        drawer.querySelector('a')?.focus();
      });
    };

    const closeNav = () => {
      toggle.setAttribute('aria-expanded', 'false');
      drawer.classList.remove('is-open');
      document.body.style.overflow = '';
      closeTimer = window.setTimeout(() => {
        drawer.hidden = true;
      }, 250);
    };

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeNav();
      } else {
        if (closeTimer) window.clearTimeout(closeTimer);
        openNav();
      }
    });

    drawer.addEventListener('click', event => {
      const target = event.target;
      if (target instanceof HTMLAnchorElement) {
        closeNav();
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeNav();
      }
    });
  }
})();

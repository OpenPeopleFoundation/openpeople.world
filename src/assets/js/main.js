
// Mobile nav toggle & fade observer
const toggle = document.querySelector('.nav__toggle');
const list = document.querySelector('#navmenu');
if (toggle && list) {
  toggle.addEventListener('click', () => {
    const open = list.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

const io = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
      }
    });
  },
  { rootMargin: '0px 0px -12% 0px' }
);

document.querySelectorAll('.fade').forEach(element => io.observe(element));

// PWA registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

// AJAX form submit helper
const enhanceAjaxForm = form => {
  const wrap = form.closest('.form-wrap');
  const statusTarget = form.dataset.status ? document.getElementById(form.dataset.status) : null;
  const statusEl = statusTarget || wrap?.querySelector('.form-status .msg');
  if (!statusEl) return;

  const defaultButtonText = form.querySelector('button[type="submit"]')?.textContent;
  const submittingText = form.dataset.submitting || 'Submitting…';
  const successText = form.dataset.success || 'Thanks — we received your message.';
  const errorText = form.dataset.error || 'Error submitting. Please try again.';
  const networkText = form.dataset.network || 'Network error. Please try again.';
  const enableFade = form.dataset.fade === 'true';

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const submitButton = form.querySelector('button[type="submit"]');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = submittingText;
    }

    statusEl.textContent = submittingText;
    if (wrap && !reduceMotion) {
      wrap.classList.add('show-status');
    }

    const restoreButton = () => {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonText || 'Submit';
      }
    };

    const hideStatus = delay => {
      if (!wrap) return;
      if (reduceMotion) {
        wrap.classList.remove('show-status', 'fade-out');
        return;
      }
      setTimeout(() => {
        wrap.classList.remove('show-status', 'fade-out');
      }, delay);
    };

    try {
      const response = await fetch(form.action, {
        method: form.method || 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        statusEl.textContent = errorText;
        restoreButton();
        hideStatus(1200);
        return;
      }

      form.reset();
      statusEl.textContent = successText;

      if (submitButton) {
        submitButton.classList.add('success');
        setTimeout(() => submitButton.classList.remove('success'), 900);
      }

      if (wrap && enableFade && !reduceMotion) {
        setTimeout(() => {
          wrap.classList.add('fade-out');
          setTimeout(() => {
            wrap.classList.remove('fade-out', 'show-status');
            restoreButton();
          }, 400);
        }, 600);
      } else {
        restoreButton();
        hideStatus(enableFade ? 0 : 1500);
      }
    } catch (error) {
      statusEl.textContent = networkText;
      restoreButton();
      hideStatus(1500);
    }
  });
};

document.querySelectorAll('form[data-ajax]').forEach(enhanceAjaxForm);

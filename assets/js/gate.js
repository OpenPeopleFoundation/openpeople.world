// Member gate — static password memory (front-end only)
(function () {
  const PASSWORD = 'swlDash';
  const COOKIE_NAME = 'op_gate';
  const COOKIE_DAYS = 7;
  const DEST = window.OP_DEST || 'https://dash.openpeople.world/dash';

  const form = document.getElementById('gate-form');
  const input = document.getElementById('gate-input');
  const message = document.getElementById('gate-message');
  const toggle = document.querySelector('.gate__toggle');
  const submit = document.querySelector('.gate__submit');

  if (!form || !input || !message || !submit) return;

  const setCookie = (name, value, days) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax;`;
  };

  const getCookie = name => {
    return document.cookie
      .split(';')
      .map(chunk => chunk.trim())
      .find(part => part.startsWith(`${name}=`))
      ?.split('=')[1];
  };

  const updateMessage = (text, state = 'info') => {
    message.textContent = text;
    message.dataset.state = state;
  };

  // Redirect immediately if cookie present
  if (getCookie(COOKIE_NAME) === '1') {
    updateMessage('Redirecting…', 'success');
    window.location.replace(DEST);
    return;
  }

  // Toggle password visibility
  if (toggle) {
    toggle.addEventListener('click', () => {
      const isPassword = input.getAttribute('type') === 'password';
      input.setAttribute('type', isPassword ? 'text' : 'password');
      toggle.textContent = isPassword ? 'Hide' : 'Show';
      toggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
      input.focus();
    });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();

    const value = input.value.trim();
    if (!value) {
      updateMessage('Password required.', 'error');
      input.focus();
      return;
    }

    if (value === PASSWORD) {
      updateMessage('Opening dashboards…', 'success');
      submit.disabled = true;
      setCookie(COOKIE_NAME, '1', COOKIE_DAYS);
      window.requestAnimationFrame(() => window.location.assign(DEST));
    } else {
      updateMessage('Incorrect password. Try again or request a reset.', 'error');
      input.focus();
      input.select();
    }
  });

  input.focus();
})();

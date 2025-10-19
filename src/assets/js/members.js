const doc = typeof document !== 'undefined' ? document : null;
if (!doc) {
  throw new Error('Members script requires a document context.');
}

const appRoot = doc.querySelector('[data-members-app]');
if (!appRoot) {
  // Not on the members page; nothing to execute.
} else {
  (async () => {
    const dataset = (doc.body && doc.body.dataset) || {};
    const SUPABASE_URL =
      dataset.supabaseUrl ||
      (typeof window !== 'undefined' ? window.SUPABASE_URL : undefined) ||
      (typeof SUPABASE_URL_KEY !== 'undefined' ? SUPABASE_URL_KEY : undefined) ||
      'https://vwrqapholagchwzkkqpt.supabase.co';
    const SUPABASE_ANON =
      dataset.supabaseAnon ||
      (typeof window !== 'undefined' ? window.SUPABASE_ANON : undefined) ||
      (typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : undefined) ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cnFhcGhvbGFnY2h3emtrcXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjcyMjIsImV4cCI6MjA3NjE0MzIyMn0.cYUNYMx4ebvly0fLWFTtAqWVLEuPmOTZ21wzxEt1_kI';

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

    const form = doc.getElementById('members-login-form');
    const emailInput = doc.getElementById('members-email');
    const statusEl = doc.getElementById('members-auth-message');
    const loginButton = doc.getElementById('members-login-button');
    const logoutButton = doc.getElementById('members-logout');
    const refreshButton = doc.getElementById('members-refresh');
    const emailTarget = doc.getElementById('members-user-email');
    const pendingNotice = doc.getElementById('members-pending-notice');
    const hub = doc.getElementById('members-hub');
    const appPanels = {
      guest: doc.getElementById('members-auth-panel'),
      authed: doc.getElementById('members-authenticated')
    };

    const roleButtons = Array.from(doc.querySelectorAll('.role-switcher__btn'));
    const roleTargets = Array.from(doc.querySelectorAll('[data-role]'));

    const setStatus = text => {
      if (statusEl) statusEl.textContent = text || '';
    };

    const setLoading = isLoading => {
      if (!loginButton) return;
      loginButton.disabled = isLoading;
      loginButton.textContent = isLoading ? 'Sending…' : 'Send magic link';
    };

    const togglePanels = isAuthed => {
      if (!appPanels.guest || !appPanels.authed) return;
      appPanels.guest.style.display = isAuthed ? 'none' : '';
      appPanels.authed.style.display = isAuthed ? '' : 'none';
    };

    const parseRoles = raw => {
      if (!raw) return [];
      if (Array.isArray(raw)) {
        return raw.map(String);
      }
      if (typeof raw === 'string') {
        return raw
          .split(',')
          .map(role => role.trim())
          .filter(Boolean);
      }
      return [];
    };

    let memberRoles = ['owner'];

    const syncRoleButtons = activeRole => {
      roleButtons.forEach(btn => {
        const role = btn.dataset.role || '';
        const allowed = memberRoles.includes(role);
        btn.disabled = !allowed;
        btn.classList.toggle('is-disabled', !allowed);
        btn.classList.toggle('is-active', role === activeRole);
        btn.setAttribute('aria-pressed', String(role === activeRole));
        btn.setAttribute('aria-disabled', String(!allowed));
      });
    };

    const applyRoleFilter = activeRole => {
      syncRoleButtons(activeRole);
      roleTargets.forEach(node => {
        const allowedRoles = (node.dataset.role || '')
          .split(/\s+/)
          .filter(Boolean);
        const shouldShow = allowedRoles.length === 0 || allowedRoles.includes(activeRole);
        node.style.display = shouldShow ? '' : 'none';
      });
    };

    const loadAccount = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Supabase auth error', error);
        togglePanels(false);
        setStatus('We could not verify your session. Try again.');
        return { user: null, profile: null };
      }

      const user = data.user;
      if (!user) {
        togglePanels(false);
        hub?.classList.remove('is-active');
        pendingNotice?.classList.remove('is-hidden');
        applyRoleFilter(memberRoles[0]);
        return { user: null, profile: null };
      }

      togglePanels(true);
      if (emailTarget) {
        emailTarget.textContent = user.email || 'member';
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_member, roles')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.warn('Unable to load profile', profileError);
      }

      const isMember = !!profile?.is_member;
      memberRoles = parseRoles(profile?.roles);
      if (memberRoles.length === 0) {
        memberRoles = ['owner'];
      }

      if (hub) {
        hub.classList.toggle('is-active', isMember);
      }
      if (pendingNotice) {
        pendingNotice.classList.toggle('is-hidden', isMember);
      }

      const defaultRole = memberRoles.includes('owner') ? 'owner' : memberRoles[0];
      applyRoleFilter(defaultRole);

      return { user, profile: profile || null };
    };

    if (form) {
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const email = emailInput?.value.trim();
        if (!email) {
          setStatus('Enter the email connected to your account.');
          return;
        }
        setLoading(true);
        setStatus('Sending magic link…');
        try {
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: `${window.location.origin}/members/` }
          });
          if (error) throw error;
          setStatus('Check your email for the sign-in link.');
          form.reset();
        } catch (err) {
          console.error('Magic link error', err);
          setStatus(err?.message || 'Could not send link. Try again.');
        } finally {
          setLoading(false);
        }
      });
    }

    if (logoutButton) {
      logoutButton.addEventListener('click', async () => {
        await supabase.auth.signOut();
        togglePanels(false);
        setStatus('');
      });
    }

    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        loadAccount();
      });
    }

    roleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        applyRoleFilter(btn.dataset.role || 'owner');
      });
    });

    supabase.auth.onAuthStateChange(() => {
      loadAccount();
    });

    await loadAccount();
  })();
}

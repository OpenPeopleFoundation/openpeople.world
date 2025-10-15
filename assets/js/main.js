
// Mobile nav toggle & fade observer
const toggle = document.querySelector('.nav__toggle');
const list = document.querySelector('#navmenu');
if (toggle && list){
  toggle.addEventListener('click', () => {
    const open = list.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); } });
}, {rootMargin: '0px 0px -12% 0px'});
document.querySelectorAll('.fade').forEach(el => io.observe(el));

cat >> assets/js/main.js <<'EOF'

// PWA registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}

// AJAX form submit with micro-fade (Join)
(function(){
  const wrap = document.getElementById('join-form-wrap');
  if(!wrap) return;
  const form = wrap.querySelector('form[data-ajax]');
  const status = document.getElementById('join-form-status');
  if(!form || !status) return;

  form.addEventListener('submit', async (e) => {
    // if user prefers reduced motion, we still run but without fade
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    if(btn){ btn.disabled = true; btn.textContent = 'Submitting…'; }
    if(!reduce){ wrap.classList.add('show-status'); status.textContent = 'Submitting…'; }

    try{
      const fd = new FormData(form);
      const resp = await fetch(form.action, {
        method: 'POST',
        body: fd,
        headers: { 'Accept': 'application/json' }
      });
      if(resp.ok){
        if(!reduce){ status.textContent = 'Thank you — reflection received.'; }
        form.reset();
        if(!reduce){
          // brief success pause + fade out the form wrapper
          setTimeout(()=> {
            wrap.classList.add('fade-out');
            setTimeout(()=> {
              wrap.classList.remove('show-status', 'fade-out');
              if(btn){ btn.disabled = false; btn.textContent = 'Submit Reflection'; }
            }, 400);
          }, 600);
        }else{
          if(btn){ btn.disabled = false; btn.textContent = 'Submit Reflection'; }
        }
      }else{
        if(!reduce){ status.textContent = 'Error submitting. Please try again.'; }
        if(btn){ btn.disabled = false; btn.textContent = 'Submit Reflection'; }
      }
    }catch(err){
      if(!reduce){ status.textContent = 'Network error. Please try again.'; }
      if(btn){ btn.disabled = false; btn.textContent = 'Submit Reflection'; }
    }
  });
})();
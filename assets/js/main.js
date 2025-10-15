
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

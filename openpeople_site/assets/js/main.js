
// Mobile nav toggle
const toggle = document.querySelector('.nav__toggle');
const list = document.querySelector('#navmenu');
if (toggle && list){
  toggle.addEventListener('click', () => {
    const open = list.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// Fade-in on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting){ e.target.classList.add('in'); }
  });
}, {rootMargin: '0px 0px -10% 0px'});
document.querySelectorAll('.fade').forEach(el => io.observe(el));

// Footer year
const y = document.getElementById('year');
if (y){ y.textContent = new Date().getFullYear(); }

// Scroll reveal (IntersectionObserver)
// Scroll reveal (IntersectionObserver) — disconnect after first reveal
(function(){
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        obs.unobserve(e.target); // <-- disconnect this element to save battery/CPU
      }
    });
  }, { rootMargin: '0px 0px -12% 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

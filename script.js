(function(){
"use strict";

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============ Mobile nav ============ */
const mobileNav = document.getElementById('mobile-nav');
const menuOpenBtn = document.getElementById('menu-open-btn');
const menuCloseBtn = document.getElementById('menu-close-btn');
function openMobileNav(){ mobileNav.classList.add('open'); menuOpenBtn.setAttribute('aria-expanded','true'); document.documentElement.style.overflow='hidden'; }
function closeMobileNav(){ if(!mobileNav.classList.contains('open')) return; mobileNav.classList.remove('open'); menuOpenBtn.setAttribute('aria-expanded','false'); document.documentElement.style.overflow=''; }
if(menuOpenBtn){ menuOpenBtn.addEventListener('click', openMobileNav); }
if(menuCloseBtn){ menuCloseBtn.addEventListener('click', closeMobileNav); }
document.querySelectorAll('#mobile-nav a').forEach(a => a.addEventListener('click', closeMobileNav));

/* ============ Contact modal ============ */
const requestModal = document.getElementById('request-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalCloseBtn = document.getElementById('modal-close-btn');
const requestForm = document.getElementById('request-form');
const modalSuccess = document.getElementById('modal-success');

function openRequestModal(){
  if(!requestModal) return;
  closeMobileNav();
  requestModal.classList.add('open');
}
function closeRequestModal(){
  if(!requestModal) return;
  requestModal.classList.remove('open');
  setTimeout(() => {
    if(requestForm){ requestForm.style.display = ''; requestForm.reset(); }
    if(modalSuccess) modalSuccess.classList.remove('show');
    const err = document.getElementById('modal-error');
    if(err) err.classList.remove('show');
  }, 400);
}
document.querySelectorAll('[data-open-modal]').forEach(btn => {
  btn.addEventListener('click', (e) => { e.preventDefault(); openRequestModal(); });
});
if(modalBackdrop) modalBackdrop.addEventListener('click', closeRequestModal);
if(modalCloseBtn) modalCloseBtn.addEventListener('click', closeRequestModal);
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape'){
    if(requestModal && requestModal.classList.contains('open')) closeRequestModal();
    else closeMobileNav();
  }
});

async function submitLeadForm(form, submitBtn, errorEl, onSuccess){
  const labelEl = submitBtn.querySelector('.btn-label');
  const originalLabel = labelEl ? labelEl.textContent : '';
  if(errorEl) errorEl.classList.remove('show');
  submitBtn.disabled = true;
  submitBtn.classList.add('is-loading');
  if(labelEl) labelEl.textContent = 'Sending…';
  try{
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch('https://api.web3forms.com/submit', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if(!response.ok || result.success === false) throw new Error(result.message || 'Request failed');
    onSuccess();
  } catch(err){
    if(errorEl) errorEl.classList.add('show');
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove('is-loading');
    if(labelEl) labelEl.textContent = originalLabel;
  }
}

if(requestForm){
  requestForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = requestForm.querySelector('.form-submit');
    const errorEl = document.getElementById('modal-error');
    submitLeadForm(requestForm, submitBtn, errorEl, () => {
      requestForm.style.display = 'none';
      if(modalSuccess) modalSuccess.classList.add('show');
    });
  });
}

// Dedicated contact-page form (same handler, separate element)
const pageForm = document.getElementById('page-contact-form');
if(pageForm){
  pageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = pageForm.querySelector('.form-submit');
    const errorEl = document.getElementById('page-form-error');
    const successEl = document.getElementById('page-form-success');
    submitLeadForm(pageForm, submitBtn, errorEl, () => {
      pageForm.style.display = 'none';
      if(successEl) successEl.classList.add('show');
    });
  });
}

/* ============ Floating CTA ============ */
const floatingCta = document.getElementById('floating-cta');
if(floatingCta){
  function updateFloatingCta(){
    const y = window.scrollY || document.documentElement.scrollTop;
    floatingCta.classList.toggle('show', y > 240);
  }
  updateFloatingCta();
  window.addEventListener('scroll', updateFloatingCta, { passive:true });
}

/* ============ Scroll reveal ============ */
if(REDUCED_MOTION){
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold:0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ============ Sticky navbar shadow on scroll ============ */
const navbar = document.getElementById('navbar');
if(navbar){
  function updateNavShadow(){
    const y = window.scrollY || document.documentElement.scrollTop;
    navbar.style.boxShadow = y > 8 ? '0 .5rem 1.5rem -1rem rgba(0,0,0,.5)' : 'none';
  }
  updateNavShadow();
  window.addEventListener('scroll', updateNavShadow, { passive:true });
}

})();

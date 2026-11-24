'use strict';
/* ===== EDIT YOUR DETAILS HERE ===== */
const CONFIG = {
  whatsapp: '2349133442770',
  email: 'gideonekome@gmail.com',
  linkedin: 'https://www.linkedin.com/in/gideon-ekome-45244b314/',
  github: 'https://github.com/geebhoy',
  formEndpoint: '',
  projects: {
    gym:     { demo: 'https://geebhoy.github.io/gym-desk/', repo: '' },
    gadgets: { demo: 'https://geebhoy.github.io/tempted-gadget/', repo: '' },
    food:    { demo: 'https://geebhoy.github.io/larry/', repo: '' },
    concert: { demo: 'https://geebhoy.github.io/EM-Consult/', repo: '' }
  }
};
/* ================================== */

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const toastEl = $('#toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
}

/* Links: only real once configured; otherwise show a clear message */
function setLink(el, url, missingMsg) {
  if (url) {
    el.href = url;
    el.removeAttribute('aria-disabled');
    if (/^https?:/.test(url)) { el.target = '_blank'; el.rel = 'noopener'; }
  } else {
    el.setAttribute('role', 'link');
    el.setAttribute('aria-disabled', 'true');
    el.tabIndex = 0;
    const show = e => { e.preventDefault(); toast(missingMsg); };
    el.addEventListener('click', show);
    el.addEventListener('keydown', e => { if (e.key === 'Enter') show(e); });
  }
}
$$('[data-project]').forEach(a => {
  const url = (CONFIG.projects[a.dataset.project] || {})[a.dataset.kind];
  setLink(a, url, 'Link coming soon. Add it in script.js.');
});
$$('[data-contact]').forEach(a => {
  const k = a.dataset.contact;
  const url = k === 'whatsapp' ? CONFIG.whatsapp && `https://wa.me/${CONFIG.whatsapp}`
            : k === 'email' ? CONFIG.email && `mailto:${CONFIG.email}`
            : CONFIG[k];
  setLink(a, url, `Add your ${k} details in script.js.`);
});

/* Header, back-to-top */
const header = $('#header'), toTop = $('#toTop');
addEventListener('scroll', () => {
  header.classList.toggle('scrolled', scrollY > 20);
  toTop.classList.toggle('show', scrollY > 600);
}, { passive: true });
toTop.addEventListener('click', () => scrollTo({ top: 0 }));

/* Mobile menu */
const menuBtn = $('#menuBtn'), navLinks = $('#navLinks');
function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  navLinks.classList.toggle('open', open);
}
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
$$('a', navLinks).forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* Active nav link */
const links = $$('.nav-links a');
const spy = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) links.forEach(l => l.classList.toggle('active', l.hash === '#' + en.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(s => spy.observe(s));

/* Scroll reveal */
const rv = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); }
}), { threshold: .12 });
$$('.reveal').forEach(el => rv.observe(el));

/* Project filter */
$$('.filter').forEach(btn => btn.addEventListener('click', () => {
  $$('.filter').forEach(b => { b.classList.toggle('active', b === btn); b.setAttribute('aria-pressed', b === btn); });
  $$('.project').forEach(p => p.classList.toggle('hide', btn.dataset.filter !== 'all' && p.dataset.cat !== btn.dataset.filter));
}));

/* Contact form */
const form = $('#contactForm'), status = $('#formStatus');
const rules = {
  name: v => v.trim().length >= 2 || 'Enter your name.',
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address.',
  subject: v => v.trim().length >= 3 || 'Enter a subject.',
  message: v => v.trim().length >= 10 || 'Write at least 10 characters.'
};
function check(input) {
  const r = rules[input.name](input.value);
  const field = input.closest('.field');
  field.classList.toggle('invalid', r !== true);
  $('.err', field).textContent = r === true ? '' : r;
  input.setAttribute('aria-invalid', r !== true);
  return r === true;
}
$$('input,textarea', form).forEach(i => i.addEventListener('blur', () => check(i)));
form.addEventListener('submit', async e => {
  e.preventDefault();
  status.className = 'status';
  const inputs = $$('input,textarea', form);
  const valid = inputs.map(check).every(Boolean);
  if (!valid) { inputs.find(i => i.getAttribute('aria-invalid') === 'true').focus(); return; }
  if (!CONFIG.formEndpoint) {
    status.textContent = 'Message not sent: the form is not connected yet. Please use WhatsApp or email.';
    return;
  }
  try {
    status.textContent = 'Sending…';
    const res = await fetch(CONFIG.formEndpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
    if (!res.ok) throw new Error();
    form.reset();
    status.textContent = 'Message sent. Thank you!';
    status.classList.add('ok');
  } catch {
    status.textContent = 'Could not send your message. Please try WhatsApp or email.';
  }
});

$('#year').textContent = new Date().getFullYear();

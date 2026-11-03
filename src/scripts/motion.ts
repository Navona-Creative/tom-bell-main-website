import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T | null;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];

let lenis: Lenis | null = null;

/* ---------- menu ---------- */
const bar = $('#bar')!;
const menu = $('#menu')!;
const openBtn = $<HTMLButtonElement>('#menuOpen')!;
const closeBtn = $<HTMLButtonElement>('#menuClose')!;
function openMenu() {
  menu.classList.add('is-open');
  openBtn.setAttribute('aria-expanded', 'true');
  document.documentElement.style.overflow = 'hidden';
  lenis?.stop();
  setTimeout(() => closeBtn.focus(), 60);
  if (!reduce) gsap.fromTo('.menu__list li a', { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.05, delay: 0.35 });
}
function closeMenu() {
  menu.classList.remove('is-open');
  openBtn.setAttribute('aria-expanded', 'false');
  document.documentElement.style.overflow = '';
  lenis?.start();
  openBtn.focus();
}
openBtn.addEventListener('click', openMenu);
closeBtn.addEventListener('click', closeMenu);
menu.addEventListener('keydown', (e) => { if ((e as KeyboardEvent).key === 'Escape') closeMenu(); });

/* ---------- header state ---------- */
let lastY = 0;
const solidAt = () => ($('.hero, .phero') ? window.innerHeight * 0.55 : 10);
function onScroll() {
  const y = window.scrollY;
  bar.classList.toggle('is-solid', y > solidAt());
  bar.classList.toggle('is-hidden', y > lastY && y > window.innerHeight && !menu.classList.contains('is-open'));
  lastY = y;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- sticky image swap (craft section; works without GSAP) ---------- */
const frames = $$('.craft__frame img');
if (frames.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const i = (en.target as HTMLElement).dataset.i;
      frames.forEach((f) => f.classList.toggle('is-on', f.dataset.i === i));
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  $$('[data-craft-step]').forEach((el) => io.observe(el));
}

/* ---------- gallery counter total ---------- */
const cards = $$('#track .work-card');
const ctrTot = $('#ctrTot');
if (ctrTot) ctrTot.textContent = String(cards.length).padStart(2, '0');

if (!reduce) {
  gsap.registerPlugin(ScrollTrigger);

  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  $$<HTMLAnchorElement>('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')!;
    const t = id.length > 1 ? $(id) : null;
    if (t) { e.preventDefault(); lenis!.scrollTo(t as HTMLElement); }
  }));

  /* hero (home + subpages) */
  const heroImg = $('[data-hero-img]');
  if (heroImg) {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from(heroImg, { scale: 1.16, duration: 2.4, ease: 'power3.out' }, 0)
      .from('[data-hero-line] > span', { yPercent: 110, duration: 1.4, stagger: 0.12 }, 0.2)
      .from('[data-hero-fade]', { opacity: 0, y: 20, duration: 1.2, stagger: 0.1 }, 0.55)
      .from('.bar__in', { opacity: 0, duration: 1.2, ease: 'power2.out' }, 0.4);
    const heroSec = heroImg.closest('section')!;
    gsap.to(heroImg, { yPercent: -12, ease: 'none', scrollTrigger: { trigger: heroSec, start: 'top top', end: 'bottom top', scrub: true } });
    const content = $('[data-hero-content]');
    if (content) gsap.to(content, { y: -80, opacity: 0, ease: 'none', scrollTrigger: { trigger: heroSec, start: '35% top', end: '90% top', scrub: true } });
  }

  /* word-by-word statements */
  $$('[data-scrub-words]').forEach((el) => {
    el.innerHTML = el.textContent!.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
    gsap.fromTo(el.querySelectorAll('.w'), { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  });

  /* image reveals + inner parallax */
  $$('[data-reveal]').forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(12% 8% 12% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 35%', scrub: true } });
    const img = el.querySelector('img');
    if (img) gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* fade-up groups (fire once) */
  $$('[data-fade]').forEach((el) => {
    gsap.from(el.children, { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  /* horizontal pinned gallery */
  const track = $('#track');
  if (track && cards.length) {
    const ctr = $('#ctr')!;
    const prog = $('#prog')!;
    $('#trackScroll')?.classList.add('is-pinned');
    const dist = () => track.scrollWidth - window.innerWidth;
    const hz = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.work', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (self) => {
          prog.style.transform = `scaleX(${self.progress})`;
          ctr.textContent = String(Math.min(cards.length, Math.floor(self.progress * (cards.length - 1) + 1.0001))).padStart(2, '0');
        },
      },
    });
    cards.forEach((c) => gsap.from(c.querySelector('img'), { scale: 1.15, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: hz, start: 'left right', end: 'right left', scrub: true } }));
  }

  /* process line */
  const stepLine = $('#stepLine');
  if (stepLine) gsap.fromTo(stepLine, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 80%', end: 'top 30%', scrub: true } });

  /* marquees (speed up with scroll velocity) */
  $$('[data-marquee]').forEach((el) => {
    const dir = el.dataset.marquee === 'right' ? 1 : -1;
    el.innerHTML += el.innerHTML;
    let x = dir < 0 ? 0 : -el.scrollWidth / 2;
    let boost = 0;
    ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onUpdate: (s) => { boost = Math.min(6, Math.abs(s.getVelocity()) / 400); } });
    gsap.ticker.add(() => {
      x += dir * (0.45 + boost); boost *= 0.94;
      const half = el.scrollWidth / 2;
      if (x <= -half) x += half;
      if (x >= 0) x -= half;
      el.style.transform = `translate3d(${x}px,0,0)`;
    });
  });

  /* CTA background parallax */
  $$('[data-par-bg]').forEach((img) => {
    gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
} else {
  const prog = $('#prog');
  if (prog) prog.style.transform = 'scaleX(1)';
}

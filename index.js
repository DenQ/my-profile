import { applyLang, detectLang, dict } from './assets/i18n.js';
import { initI18nSizes } from './assets/i18n-size.js';
import { appearI18n } from './assets/i18n-appear.js';

const CAREER_START = new Date(2010, 2, 1);

const LEAD_START = new Date(2022, 4, 1);

function pad(n) {
  return String(n).padStart(2, '0');
}

function fullYearsSince(start, now = new Date()) {
  let years = now.getFullYear() - start.getFullYear();
  const hadAnniversary =
    now.getMonth() > start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() >= start.getDate());
  if (!hadAnniversary) years -= 1;
  return Math.max(0, years);
}

function yearsWord(lang, n) {
  if (lang !== 'ru') return n === 1 ? 'year' : 'years';
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return 'год';
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return 'года';
  return 'лет';
}

function i18nVars(lang) {
  const lead = fullYearsSince(LEAD_START);
  return {
    years: fullYearsSince(CAREER_START),
    lead,
    leadWord: yearsWord(lang, lead),
  };
}

function setLang(lang, { appear = false } = {}) {
  applyLang(lang, i18nVars(lang));
  if (appear) appearI18n();
}

function initLang() {
  let lang = detectLang();
  setLang(lang);
  initI18nSizes(i18nVars);

  document.querySelectorAll('.lang__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.lang;
      if (next === lang) return;
      lang = next;
      setLang(lang, { appear: true });
    });
  });
}

const GATE = [90, 60, 145, 7, 226, 48, 171];
const MAIL_PACK = [
  62, 89, 255, 118, 151, 89, 200, 49, 14, 161, 54, 213, 112, 210, 59, 82, 245, 98, 154, 30, 217, 47,
];
const TG_PACK = [
  50, 72, 229, 119, 145, 10, 132, 117, 72, 191, 106, 135, 31, 200, 53, 88, 244, 88, 143, 81, 197, 5, 12, 161, 54,
];

const CHANNELS = {
  mail: {
    pack: MAIL_PACK,
    dots: '••••••••',
    title: 'contact.dialog.title',
    lead: 'contact.dialog.lead',
    mask: 'contact.mask',
    bait: 'hello@career-desk.org',
  },
  tg: {
    pack: TG_PACK,
    dots: '••••••••',
    title: 'contact.tg.title',
    lead: 'contact.tg.lead',
    mask: 'contact.tg.mask',
    bait: '@career_desk_bot',
  },
};

function stitch(bytes, key) {
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) {
    out += String.fromCharCode(bytes[i] ^ key[i % key.length]);
  }
  return out;
}

function copyValue(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }

  return new Promise((resolve, reject) => {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.left = '-9999px';
    document.body.append(field);
    field.select();
    const ok = document.execCommand('copy');
    field.remove();
    if (ok) resolve();
    else reject(new Error('copy'));
  });
}

function initVault() {
  const dialog = document.getElementById('vault-dialog');
  const title = document.getElementById('vault-title');
  const lead = document.getElementById('vault-lead');
  const trap = document.getElementById('vault-trap');
  const copyBtn = document.getElementById('vault-copy');
  const mask = document.getElementById('vault-mask');
  const status = document.getElementById('vault-status');
  const openers = document.querySelectorAll('[data-vault]');
  if (!dialog || !title || !lead || !copyBtn || !mask || !openers.length) return;

  let active = CHANNELS.mail;

  const lang = () => (document.documentElement.lang === 'ru' ? 'ru' : 'en');

  const phrase = (key) => dict[key][lang()] || dict[key].en;

  const paint = () => {
    title.textContent = phrase(active.title);
    lead.textContent = phrase(active.lead);
    mask.textContent = active.dots;
    mask.classList.remove('is-plain');
    mask.setAttribute('aria-label', phrase(active.mask));
    copyBtn.textContent = phrase('contact.copy');
    if (status) status.textContent = '';
    if (trap) trap.value = active.bait;
  };

  openers.forEach((btn) => {
    btn.addEventListener('click', () => {
      active = CHANNELS[btn.dataset.vault] || CHANNELS.mail;
      paint();
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    });
  });

  dialog.addEventListener('close', paint);

  dialog.addEventListener('click', (event) => {
    const box = dialog.getBoundingClientRect();
    const outside =
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom;
    if (outside) dialog.close();
  });

  copyBtn.addEventListener('click', async (event) => {
    if (!event.isTrusted) return;

    const value = stitch(active.pack, GATE);
    if (!value) return;

    try {
      await copyValue(value);
      mask.textContent = value;
      mask.classList.add('is-plain');
      copyBtn.textContent = phrase('contact.copied');
      if (status) status.textContent = phrase('contact.copied');
    } catch {
      mask.textContent = value;
      mask.classList.add('is-plain');
      if (status) status.textContent = phrase('contact.copyFail');
    }
  });
}

function initTopbar() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  const onScroll = () => {
    topbar.classList.toggle('is-solid', window.scrollY > 12);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function chapterYear(chapter) {
  return (
    chapter.dataset.year ||
    chapter.querySelector('.chapter__year')?.textContent.trim() ||
    ''
  );
}

function initSpineYears() {
  const nav = document.querySelector('.spine__years');
  const chapters = [...document.querySelectorAll('.chapter')];
  if (!nav || !chapters.length) return;

  const seen = new Set();
  const frag = document.createDocumentFragment();

  chapters.forEach((chapter) => {
    const year = chapterYear(chapter);
    if (!year || seen.has(year)) return;
    seen.add(year);

    const link = document.createElement('a');
    link.href = `#${chapter.id}`;
    link.textContent = year;
    link.dataset.year = year;
    frag.append(link);
  });

  nav.replaceChildren(frag);
}

function initChapterReveal() {
  const chapters = document.querySelectorAll('.chapter');
  if (!chapters.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    chapters.forEach((node) => node.classList.add('is-inview'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
        }
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
  );

  chapters.forEach((node) => observer.observe(node));
}

function initChapterProgress() {
  const chapters = [...document.querySelectorAll('.chapter')];
  const railLabel = document.getElementById('chapter-rail-label');
  const topBar = document.getElementById('progress-top');
  const yearLinks = [...document.querySelectorAll('.spine__years a')];
  if (!chapters.length) return;

  const total = chapters.length;

  const setActiveYear = (chapter) => {
    const year = chapterYear(chapter);
    yearLinks.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.year === year);
    });
  };

  const setChapterLabel = (index) => {
    if (!railLabel) return;
    const lang = document.documentElement.lang === 'ru' ? 'ru' : 'en';
    const template = dict['progress.chapter'][lang] || dict['progress.chapter'].en;
    railLabel.textContent = template
      .replace('{current}', pad(index + 1))
      .replace('{total}', pad(total));
  };

  const update = () => {
    const marker = window.scrollY + window.innerHeight * 0.42;
    let active = 0;

    chapters.forEach((chapter, index) => {
      if (marker >= chapter.offsetTop) active = index;
    });

    setChapterLabel(active);
    setActiveYear(chapters[active]);

    if (topBar) {
      const start = chapters[0].offsetTop;
      const end = chapters[chapters.length - 1].offsetTop + chapters[chapters.length - 1].offsetHeight;
      const span = Math.max(1, end - start - window.innerHeight * 0.35);
      const ratio = Math.min(1, Math.max(0, (window.scrollY + window.innerHeight * 0.2 - start) / span));
      topBar.style.width = `${ratio * 100}%`;
    }
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

document.addEventListener('DOMContentLoaded', () => {
  initLang();
  initVault();
  initTopbar();
  initSpineYears();
  initChapterReveal();
  initChapterProgress();
});

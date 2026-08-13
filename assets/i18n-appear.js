const VIEW_SLACK = 80;
const STAGGER_MS = 70;
const CLASS = 'is-appearing';

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function shouldSkip(node) {
  if (node.classList.contains('skip-link')) return true;
  if (node.closest('dialog')) return true;
  return false;
}

function appearTarget(node) {
  return node.closest('.btn') || node;
}

function inViewport(node) {
  const box = node.getBoundingClientRect();
  return box.bottom > -VIEW_SLACK && box.top < window.innerHeight + VIEW_SLACK && box.width > 0;
}

function clearAppear(node) {
  node.classList.remove(CLASS);
  node.style.removeProperty('--appear-delay');
}

export function appearI18n() {
  document.querySelectorAll(`.${CLASS}`).forEach(clearAppear);

  if (reducedMotion()) return;

  const nodes = [...document.querySelectorAll('[data-i18n]')].filter(
    (node) => !shouldSkip(node) && inViewport(appearTarget(node))
  );

  const seen = new Set();

  nodes.forEach((node) => {
    const target = appearTarget(node);
    if (seen.has(target)) return;
    seen.add(target);

    target.style.setProperty('--appear-delay', `${(seen.size - 1) * STAGGER_MS}ms`);
    void target.offsetWidth;
    target.classList.add(CLASS);
    target.addEventListener(
      'animationend',
      (event) => {
        if (event.target !== target || event.animationName !== 'phrase-in') return;
        clearAppear(target);
      },
      { once: true }
    );
  });
}

import { resolvePhrase } from './i18n.js';

const LANGS = ['en', 'ru'];
const RESIZE_MS = 120;

let measurer;

function shouldSkip(node) {
  if (node.classList.contains('skip-link')) return true;
  if (node.closest('dialog')) return true;
  if (node.closest('.btn, button')) return true;
  return false;
}

function ensureMeasurer() {
  if (measurer) return measurer;
  measurer = document.createElement('div');
  measurer.setAttribute('aria-hidden', 'true');
  measurer.style.cssText =
    'position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none;height:auto;';
  document.body.append(measurer);
  return measurer;
}

function copyType(probe, node) {
  const cs = getComputedStyle(node);
  probe.style.font = cs.font;
  probe.style.fontSize = cs.fontSize;
  probe.style.fontFamily = cs.fontFamily;
  probe.style.fontWeight = cs.fontWeight;
  probe.style.fontStyle = cs.fontStyle;
  probe.style.letterSpacing = cs.letterSpacing;
  probe.style.lineHeight = cs.lineHeight;
  probe.style.padding = cs.padding;
  probe.style.border = cs.border;
  probe.style.boxSizing = cs.boxSizing;
  probe.style.whiteSpace = cs.whiteSpace;
  probe.style.wordBreak = cs.wordBreak;
  probe.style.overflowWrap = cs.overflowWrap;
  probe.style.textTransform = cs.textTransform;
  probe.style.maxWidth = cs.maxWidth;
  probe.style.display = cs.display;
  probe.style.alignItems = cs.alignItems;
  probe.style.justifyContent = cs.justifyContent;
  probe.style.gap = cs.gap;
}

function measureAtWidth(node, text, widthPx) {
  const probe = ensureMeasurer();
  copyType(probe, node);
  probe.style.width = `${widthPx}px`;
  probe.style.minWidth = '0';
  probe.style.minHeight = '0';
  probe.textContent = text;
  return { height: probe.offsetHeight, width: probe.offsetWidth };
}

function measureNaturalWidth(node, text) {
  const probe = ensureMeasurer();
  copyType(probe, node);
  probe.style.width = 'auto';
  probe.style.maxWidth = 'none';
  probe.style.minWidth = '0';
  probe.style.minHeight = '0';
  probe.textContent = text;
  return probe.offsetWidth;
}

function fillsParent(node) {
  const parent = node.parentElement;
  if (!parent) return false;
  return node.getBoundingClientRect().width >= parent.getBoundingClientRect().width - 1;
}

function shouldLockWidth(node, cs) {
  const display = cs.display;
  if (display !== 'inline-flex' && display !== 'inline-block' && display !== 'inline') return false;
  if (fillsParent(node) && !node.closest('.btn')) return false;
  return true;
}

function shouldLockHeight(cs) {
  return cs.display !== 'inline';
}

export function lockI18nSizes(varsFor) {
  const nodes = document.querySelectorAll('[data-i18n]');

  nodes.forEach((node) => {
    if (shouldSkip(node)) {
      node.style.minHeight = '';
      node.style.minWidth = '';
      return;
    }

    const key = node.getAttribute('data-i18n');
    node.style.minHeight = '';
    node.style.minWidth = '';

    const cs = getComputedStyle(node);
    const lockW = shouldLockWidth(node, cs);
    const lockH = shouldLockHeight(cs);
    const usedWidth = node.getBoundingClientRect().width;
    if (!usedWidth && !lockW) return;

    let maxH = 0;
    let maxW = 0;

    LANGS.forEach((lang) => {
      const text = resolvePhrase(key, lang, varsFor(lang) || {});
      if (text == null) return;
      if (lockH && usedWidth) {
        const box = measureAtWidth(node, text, usedWidth);
        maxH = Math.max(maxH, box.height);
      }
      if (lockW) maxW = Math.max(maxW, measureNaturalWidth(node, text));
    });

    if (lockH && maxH > 0) node.style.minHeight = `${maxH}px`;
    if (lockW && maxW > 0) node.style.minWidth = `${maxW}px`;
  });
}

export function initI18nSizes(varsFor) {
  const run = () => lockI18nSizes(varsFor);
  run();

  if (document.fonts?.ready) {
    document.fonts.ready.then(run).catch(() => {});
  }

  let timer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(run, RESIZE_MS);
  });
}

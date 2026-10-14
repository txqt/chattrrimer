/**
 * ChatTrimmer — content script (ChatGPT)
 *
 * Gấp các tin nhắn cũ thành từng "fold" để trang nhẹ hơn, và cho phép mở lại
 * từng fold. Triển khai độc lập; selector tham khảo cấu trúc DOM của ChatGPT.
 */
(() => {
  'use strict';

  if (window.__chatTrimmerLoaded) return;
  window.__chatTrimmerLoaded = true;

  const HIDDEN_CLASS = 'ct-hidden';
  const FOLD_SIZE = 50; // số tin gom vào một fold

  const DEFAULTS = { isEnabled: true, maxVisible: 30 };

  const SITE = {
    name: 'ChatGPT',
    host: /(^|\.)(chatgpt\.com|chat\.openai\.com)$/,
    // ChatGPT 2026: mỗi tin là [data-content-search-unit-key], value kết thúc ":user"/":assistant"
    message: '[data-content-search-unit-key]',
    root: ['.thread-scroll-container', '[data-thread-user-message-navigation-content="true"]'],
    protect: 'form, input, textarea, [contenteditable="true"], [role="textbox"]',
  };

  const PREFIXES = [/^You said:\s*/i, /^ChatGPT said:\s*/i, /^Bạn đã nói:\s*/i, /^ChatGPT đã nói:\s*/i];

  let settings = { ...DEFAULTS };
  let hidden = new Set();     // element đang bị ẩn
  let unfolded = new Set();   // element người dùng đã mở
  let unfoldAll = false;
  let button = null;
  let observer = null;
  let applying = false;
  let lastUrl = location.href;

  // ---------- Tiện ích ----------

  function cleanText(raw) {
    let t = (raw || '').trim().replace(/\s+/g, ' ');
    for (const p of PREFIXES) t = t.replace(p, '');
    return t;
  }

  function t(key, subs) {
    try {
      return chrome.i18n.getMessage(key, subs) || key;
    } catch {
      return key;
    }
  }

  function isUser(el) {
    return ((el.getAttribute('data-content-search-unit-key') || '').endsWith(':user'));
  }

  function keepCount() {
    return Math.max(1, Number(settings.maxVisible) || DEFAULTS.maxVisible);
  }

  function isSite() {
    return SITE.host.test(location.hostname);
  }

  function collectMessages() {
    const seen = new Set();
    const out = [];
    for (const el of document.querySelectorAll(SITE.message)) {
      if (seen.has(el)) continue;
      seen.add(el);
      if (el.closest(SITE.protect)) continue;
      if (el.querySelector(SITE.protect)) continue;
      if (cleanText(el.textContent).length < 2) continue;
      out.push(el);
    }
    return out;
  }

  function hide(el) {
    el.classList.add(HIDDEN_CLASS);
    hidden.add(el);
  }

  function reveal(el) {
    el.classList.remove(HIDDEN_CLASS);
    hidden.delete(el);
  }

  function revealEverything() {
    for (const el of hidden) el.classList.remove(HIDDEN_CLASS);
    hidden.clear();
  }

  // ---------- Fold ----------

  // Các dải tin liền nhau đang bị ẩn (bỏ qua tin đã mở), cắt tiếp thành fold.
  function computeFolds() {
    const msgs = collectMessages();
    const hideLimit = Math.max(0, msgs.length - keepCount());
    const folds = [];
    let run = null;

    const flush = () => {
      if (!run) return;
      for (let s = run.from; s <= run.to; s += FOLD_SIZE) {
        const to = Math.min(s + FOLD_SIZE - 1, run.to);
        folds.push({
          from: s,
          to,
          count: to - s + 1,
          preview: cleanText(msgs[s - 1].textContent).slice(0, 44),
        });
      }
      run = null;
    };

    for (let i = 0; i < hideLimit; i++) {
      const el = msgs[i];
      if (unfoldAll || unfolded.has(el)) { flush(); continue; }
      if (run && run.to === i) run.to = i + 1;
      else { flush(); run = { from: i + 1, to: i + 1 }; }
    }
    flush();

    return folds;
  }

  function unfoldRange(from, to) {
    const msgs = collectMessages();
    for (let i = from - 1; i < to && i < msgs.length; i++) unfolded.add(msgs[i]);
    applyTrim();
  }

  // ---------- Lõi ----------

  function schedule() {
    if (applying) return;
    applying = true;
    requestAnimationFrame(() => {
      applying = false;
      applyTrim();
    });
  }

  function applyTrim() {
    if (!isSite()) return;

    if (!settings.isEnabled) {
      revealEverything();
      paintButton();
      return;
    }

    const msgs = collectMessages();
    const hideLimit = Math.max(0, msgs.length - keepCount());

    for (let i = 0; i < msgs.length; i++) {
      const el = msgs[i];
      if (i < hideLimit && !unfoldAll && !unfolded.has(el)) hide(el);
      else reveal(el);
    }

    for (const el of [...hidden]) if (!el.isConnected) hidden.delete(el);

    paintButton();
  }

  // ---------- Nút trên trang ----------

  function mountButton() {
    if (button) return;
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'ct-show-more';
    button.hidden = true;
    button.addEventListener('click', () => {
      const folds = computeFolds();
      if (!folds.length) return;
      const newest = folds[folds.length - 1]; // fold sát đuôi nhất
      unfoldRange(newest.from, newest.to);
    });
    (document.body || document.documentElement).appendChild(button);
  }

  function paintButton() {
    if (!button) return;
    const n = hidden.size;
    if (n === 0) {
      button.hidden = true;
      return;
    }
    const folds = computeFolds();
    const newest = folds[folds.length - 1];
    button.hidden = false;
    button.textContent = t('contentOpen', [String(newest ? newest.count : n), String(n)]);
  }

  // ---------- Theo dõi DOM ----------

  function observe() {
    if (observer) observer.disconnect();

    const root = SITE.root.map((s) => document.querySelector(s)).find(Boolean) || document.body;
    let timer = null;
    observer = new MutationObserver(() => {
      if (timer) return;
      timer = setTimeout(() => { timer = null; schedule(); }, 400);
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  function watchUrl() {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    unfolded.clear();
    unfoldAll = false;
    revealEverything();
    observe();
    schedule();
  }

  // ---------- Dữ liệu cho popup ----------

  function cleanTitle(title) {
    return (title || '').replace(/\s*[-–|]\s*ChatGPT\s*$/i, '').trim() || 'ChatGPT';
  }

  function getState() {
    const msgs = collectMessages();
    let user = 0;
    for (const el of msgs) if (isUser(el)) user++;

    return {
      platform: SITE.name,
      title: cleanTitle(document.title),
      total: msgs.length,
      hidden: hidden.size,
      visible: msgs.length - hidden.size,
      tail: Math.min(keepCount(), msgs.length),
      folds: computeFolds(),
      user,
      ai: msgs.length - user,
    };
  }

  function getExportRows() {
    return collectMessages().map((el, i) => {
      const text = cleanText(el.textContent);
      const u = isUser(el);
      return { index: i + 1, isUser: u, sender: u ? t('senderYou') : 'ChatGPT', content: text, length: text.length };
    });
  }

  // ---------- Cài đặt ----------

  async function loadSettings() {
    const saved = await chrome.storage.sync.get(DEFAULTS);
    settings = { ...DEFAULTS, ...saved };
  }

  function applySettings(next) {
    settings = { ...settings, ...(next || {}) };
    unfoldAll = false;
    applyTrim();
  }

  function boot() {
    if (!isSite()) return;
    mountButton();
    observe();
    schedule();
  }

  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (!request || typeof request.type !== 'string') return;

    switch (request.type) {
      case 'ct:state':
        sendResponse({ ok: true, data: getState() });
        break;
      case 'ct:setSettings':
        applySettings(request.settings);
        sendResponse({ ok: true });
        break;
      case 'ct:unfoldFold':
        unfoldRange(request.from, request.to);
        sendResponse({ ok: true });
        break;
      case 'ct:unfoldAll':
        unfoldAll = true;
        applyTrim();
        sendResponse({ ok: true });
        break;
      case 'ct:export':
        sendResponse({ ok: true, data: getExportRows() });
        break;
      default:
        return;
    }
    return true;
  });

  loadSettings().then(() => {
    boot();
    setInterval(watchUrl, 1000);
  });
})();

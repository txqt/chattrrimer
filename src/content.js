/**
 * ChatTrimmer — content script
 *
 * Ẩn bớt tin nhắn cũ trong khung chat AI để trang nhẹ hơn, kèm nút "hiện thêm".
 * Triển khai độc lập; phần selector chỉ tham khảo cấu trúc DOM thực tế của
 * từng nền tảng (selector không phải tác phẩm có bản quyền).
 */
(() => {
  'use strict';

  // Content script có thể bị chèn lại sau khi reload extension.
  if (window.__chatTrimmerLoaded) return;
  window.__chatTrimmerLoaded = true;

  const HIDDEN_CLASS = 'ct-hidden';
  const FLASH_CLASS = 'ct-flash';

  const DEFAULTS = {
    isEnabled: true,
    maxVisible: 10,
    revealStep: 5,
    sites: { chatgpt: true, claude: true, grok: true, aistudio: true },
  };

  /**
   * Mỗi nền tảng khai báo: cách nhận diện tin nhắn, vùng gốc để theo dõi,
   * phần tử cần bảo vệ (không bao giờ ẩn), và cách đoán vai trò user/AI.
   */
  const PLATFORMS = [
    {
      key: 'chatgpt',
      name: 'ChatGPT',
      host: /(^|\.)(chatgpt\.com|chat\.openai\.com)$/,
      // ChatGPT 2026: mỗi tin là [data-content-search-unit-key],
      // giá trị kết thúc bằng ":user" hoặc ":assistant".
      message: '[data-content-search-unit-key]',
      root: ['.thread-scroll-container', '[data-thread-user-message-navigation-content="true"]'],
      protect: 'form, input, textarea, [contenteditable="true"], [role="textbox"]',
      role: (el) => ((el.getAttribute('data-content-search-unit-key') || '').endsWith(':user') ? 'user' : 'ai'),
    },
    {
      key: 'aistudio',
      name: 'Google AI Studio',
      host: /(^|\.)aistudio\.google\.com$/,
      message: '.user-prompt-container[data-turn-role="User"], .model-prompt-container[data-turn-role="Model"]',
      root: ['ms-chat-conversation', '[role="main"]'],
      protect: 'form, input, textarea, [contenteditable="true"], [role="textbox"], button',
      role: (el) => (el.matches('.user-prompt-container[data-turn-role="User"]') ? 'user' : 'ai'),
    },
    {
      key: 'claude',
      name: 'Claude',
      host: /(^|\.)claude\.ai$/,
      message: 'div.group.relative',
      root: ['[data-testid="conversation"]', 'main'],
      protect: 'form, input, textarea, [contenteditable="true"], [role="textbox"], .composer',
      role: (el) => (el.querySelector('[data-testid="user-message"]') ? 'user' : 'ai'),
    },
    {
      key: 'grok',
      name: 'Grok',
      host: /(^|\.)grok\.com$/,
      message: '[data-testid*="conversation-turn"], .conversation-turn, .message-pair',
      root: ['[data-testid="conversation"]', '.conversation-container', 'main'],
      protect: 'form, input, textarea, [contenteditable="true"], [role="textbox"], .composer, .input-area',
      // Grok không có dấu hiệu vai trò ổn định → xen kẽ theo thứ tự.
      role: (el, i) => (i % 2 === 0 ? 'user' : 'ai'),
    },
  ];

  const PREFIXES = [
    /^You said:\s*/i,
    /^ChatGPT said:\s*/i,
    /^Bạn đã nói:\s*/i,
    /^ChatGPT đã nói:\s*/i,
    /^Claude said:\s*/i,
    /^Claude đã nói:\s*/i,
  ];

  let settings = { ...DEFAULTS, sites: { ...DEFAULTS.sites } };
  let site = null;
  let hidden = new Set();
  let extraVisible = 0; // số tin người dùng đã bấm "hiện thêm" trong phiên
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

  function platformFor(hostname) {
    return PLATFORMS.find((p) => p.host.test(hostname)) || null;
  }

  // Danh sách tin nhắn thật, đúng thứ tự trong DOM, đã loại phần tử bảo vệ.
  function collectMessages() {
    if (!site) return [];
    const seen = new Set();
    const out = [];
    for (const el of document.querySelectorAll(site.message)) {
      if (seen.has(el)) continue;
      seen.add(el);
      if (el.closest(site.protect)) continue;
      if (el.querySelector(site.protect)) continue;
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
    if (!site) return;

    if (!settings.isEnabled || !settings.sites[site.key]) {
      revealEverything();
      paintButton();
      return;
    }

    const messages = collectMessages();
    const keep = Math.max(0, Number(settings.maxVisible) || 0) + extraVisible;
    const hideCount = Math.max(0, messages.length - keep);

    for (let i = 0; i < messages.length; i++) {
      if (i < hideCount) hide(messages[i]);
      else reveal(messages[i]);
    }

    // Dọn tham chiếu tới node đã bị SPA gỡ khỏi DOM.
    for (const el of [...hidden]) if (!el.isConnected) hidden.delete(el);

    paintButton();
  }

  // ---------- Nút "hiện thêm" ----------

  function mountButton() {
    if (button) return;
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'ct-show-more';
    button.hidden = true;
    button.addEventListener('click', () => {
      extraVisible += Math.max(1, Number(settings.revealStep) || 1);
      applyTrim();
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
    button.hidden = false;
    button.textContent = `Hiện thêm ${Math.min(Number(settings.revealStep) || 1, n)} tin · ${n} đang ẩn`;
  }

  // ---------- Theo dõi DOM ----------

  function observe() {
    if (observer) observer.disconnect();
    if (!site) return;

    const root = site.root.map((s) => document.querySelector(s)).find(Boolean) || document.body;

    let timer = null;
    observer = new MutationObserver(() => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        schedule();
      }, 400);
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  function watchUrl() {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    extraVisible = 0;
    revealEverything();
    boot();
  }

  // ---------- Thống kê cho popup ----------

  function basicStats() {
    const messages = collectMessages();
    const shownHidden = messages.filter((m) => m.classList.contains(HIDDEN_CLASS)).length;
    return {
      platform: site ? site.name : null,
      total: messages.length,
      hidden: shownHidden,
      visible: messages.length - shownHidden,
    };
  }

  function detailedStats() {
    const messages = collectMessages();
    const list = messages.map((el, i) => {
      const role = site.role(el, i);
      const text = cleanText(el.textContent);
      const id = `ct-${i + 1}`;
      el.setAttribute('data-ct-id', id);
      return {
        id,
        index: i + 1,
        isUser: role === 'user',
        sender: role === 'user' ? 'Bạn' : site.name,
        preview: text.length > 100 ? `${text.slice(0, 100)}…` : text,
        length: text.length,
        content: text,
      };
    });
    return {
      platform: site ? site.name : null,
      hidden: messages.filter((m) => m.classList.contains(HIDDEN_CLASS)).length,
      totalUser: list.filter((m) => m.isUser).length,
      totalAi: list.filter((m) => !m.isUser).length,
      totalAll: list.length,
      messages: list,
    };
  }

  function goToMessage(id) {
    const el = document.querySelector(`[data-ct-id="${CSS.escape(id)}"]`);
    if (!el) return false;
    extraVisible = Infinity; // hiện hết để nhảy tới được
    applyTrim();
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add(FLASH_CLASS);
      setTimeout(() => el.classList.remove(FLASH_CLASS), 2000);
    }, 100);
    return true;
  }

  // ---------- Cài đặt ----------

  async function loadSettings() {
    const saved = await chrome.storage.sync.get(DEFAULTS);
    settings = {
      ...DEFAULTS,
      ...saved,
      sites: { ...DEFAULTS.sites, ...(saved.sites || {}) },
    };
  }

  function applySettings(next) {
    settings = {
      ...settings,
      ...next,
      sites: { ...settings.sites, ...((next && next.sites) || {}) },
    };
    boot();
  }

  // ---------- Khởi động ----------

  function boot() {
    site = platformFor(location.hostname);
    if (!site) return;
    mountButton();
    observe();
    schedule();
  }

  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (!request || typeof request.type !== 'string') return;

    switch (request.type) {
      case 'ct:stats':
        sendResponse({ ok: true, data: basicStats() });
        break;
      case 'ct:detailed':
        sendResponse({ ok: true, data: detailedStats() });
        break;
      case 'ct:setSettings':
        applySettings(request.settings);
        sendResponse({ ok: true });
        break;
      case 'ct:goto':
        sendResponse({ ok: true, found: goToMessage(request.id) });
        break;
      case 'ct:revealAll':
        extraVisible = Infinity;
        applyTrim();
        sendResponse({ ok: true });
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

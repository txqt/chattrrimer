/**
 * ChatTrimmer — popup logic (Concept 5: Thread Accordion)
 */
(() => {
  'use strict';

  const DEFAULTS = { isEnabled: true, maxVisible: 30, lang: 'auto' };

  const $ = (id) => document.getElementById(id);
  const t = (key, subs) => CT_I18N.t(key, subs);

  let settings = { ...DEFAULTS };
  let state = null;
  let saveTimer = null;
  let toastTimer = null;

  // ---------- i18n ----------

  function localizeStatic() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('on', btn.dataset.lang === CT_I18N.lang());
    });
  }

  // ---------- Hạ tầng ----------

  async function readSettings() {
    const saved = await chrome.storage.sync.get(DEFAULTS);
    return { ...DEFAULTS, ...saved };
  }

  async function currentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab || null;
  }

  function sendMessage(tabId, message) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        resolve(chrome.runtime.lastError ? undefined : response);
      });
    });
  }

  // Chèn content script khi tab được mở từ trước lúc extension reload.
  async function injectContent(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['src/i18n.js', 'src/content.js'],
      });
      return true;
    } catch {
      return false; // tab không phải trang được hỗ trợ
    }
  }

  async function ask(type, payload) {
    const tab = await currentTab();
    if (!tab || !tab.id) return null;

    const message = { type, ...(payload || {}) };
    let res = await sendMessage(tab.id, message);
    if (res !== undefined) return res;

    // Không có ai trả lời → chèn lại rồi thử một lần nữa.
    const injected = await injectContent(tab.id);
    if (injected) res = await sendMessage(tab.id, message);
    if (res === undefined) {
      console.warn('[ChatTrimmer] không nhận được phản hồi từ tab', tab.url || tab.id, '| đã chèn lại:', injected);
    }
    return res === undefined ? null : res;
  }

  function toast(message, isError) {
    const el = $('toast');
    el.textContent = message;
    el.className = `toast show${isError ? ' error' : ''}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = 'toast'; }, 1800);
  }

  function clamp(value, min, max, fallback) {
    const n = parseInt(value, 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function pct(part, total) {
    if (!total) return 0;
    return Math.round((part / total) * 100);
  }

  // ---------- Render ----------

  function render(data) {
    const enabled = settings.isEnabled;

    $('statePill').textContent = enabled ? t('stateActive') : t('stateOff');
    $('statePill').classList.toggle('off', !enabled);
    $('headSub').textContent = enabled ? t('headFolding') : t('headOff');
    $('statusDot').style.background = enabled ? 'var(--ok)' : 'var(--text-faint)';

    $('tailValue').textContent = t('stepperValue', String(settings.maxVisible));
    $('tailRange').value = settings.maxVisible;
    $('unfoldLabel').textContent = t('unfoldAll');

    if (!data) {
      $('threadTitle').textContent = t('unsupportedTitle');
      $('headSub').textContent = t('unsupportedSub');
      $('foldCount').textContent = t('foldsCount', '0');
      $('folds').innerHTML = `<div class="empty">${escapeHtml(t('emptyNoConversation'))}</div>`;
      $('tailTitle').textContent = t('headTail', '0');
      $('tailDesc').textContent = '';
      $('unfoldMeta').textContent = t('unfoldMeta', '0');
      $('unfoldAllBtn').disabled = true;
      $('statUser').textContent = t('statYou', ['0', '0']);
      $('statAi').textContent = t('statAi', ['0', '0']);
      return;
    }

    $('threadTitle').textContent = data.title || 'ChatGPT';
    $('tailTitle').textContent = t('headTail', String(data.tail));
    $('foldCount').textContent = t('foldsCount', String(data.folds.length));
    $('unfoldMeta').textContent = t('unfoldMeta', String(data.hidden));
    $('unfoldAllBtn').disabled = data.hidden === 0;
    $('statUser').textContent = t('statYou', [String(data.user), String(pct(data.user, data.total))]);
    $('statAi').textContent = t('statAi', [String(data.ai), String(pct(data.ai, data.total))]);

    $('tailDesc').textContent = data.hidden
      ? t('tailDescHidden', String(data.hidden))
      : t('tailDescNone');

    renderFolds(data.folds);
  }

  function renderFolds(folds) {
    const box = $('folds');
    if (!folds.length) {
      box.innerHTML = `<div class="empty">${escapeHtml(t('emptyNoFolds'))}</div>`;
      return;
    }
    box.innerHTML = folds
      .map((f, i) => `
        <div class="fold-row">
          <div class="fold-left">
            <span class="fold-index">${i + 1}</span>
            <div class="fold-info">
              <div class="fold-range">
                <span>${escapeHtml(t('foldRange', [String(f.from), String(f.to)]))}</span>
                <span class="fold-tag">${escapeHtml(t('tagFolded'))}</span>
              </div>
              <div class="fold-desc" title="${escapeAttr(f.preview)}">${escapeHtml(f.preview)}</div>
            </div>
          </div>
          <button class="fold-expand" data-from="${f.from}" data-to="${f.to}" type="button">${escapeHtml(t('actionExpand'))}</button>
        </div>`)
      .join('');

    box.querySelectorAll('.fold-expand').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const from = Number(btn.dataset.from);
        const to = Number(btn.dataset.to);
        const res = await ask('ct:unfoldFold', { from, to });
        if (!res) { toast(t('toastNoConnection'), true); return; }
        await refresh();
        toast(t('toastUnfolded', [String(from), String(to)]));
      });
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  }

  function escapeAttr(text) {
    return escapeHtml(text).replace(/"/g, '&quot;');
  }

  // ---------- Số liệu ----------

  async function refresh() {
    const res = await ask('ct:state');
    state = res && res.data ? res.data : null;
    render(state);
  }

  // ---------- Cài đặt ----------

  async function save() {
    await chrome.storage.sync.set(settings);
    const res = await ask('ct:setSettings', { settings });
    if (res) await refresh();
    else render(state);
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 300);
  }

  function bind() {
    $('statePill').addEventListener('click', async () => {
      settings.isEnabled = !settings.isEnabled;
      await chrome.storage.sync.set({ isEnabled: settings.isEnabled });
      const res = await ask('ct:setSettings', { settings });
      if (res) await refresh();
      else render(state);
    });

    $('tailRange').addEventListener('input', () => {
      settings.maxVisible = clamp($('tailRange').value, 10, 100, settings.maxVisible);
      $('tailValue').textContent = t('stepperValue', String(settings.maxVisible));
      scheduleSave();
    });

    $('unfoldAllBtn').addEventListener('click', async () => {
      const res = await ask('ct:unfoldAll');
      if (!res) { toast(t('toastNoConnection'), true); return; }
      await refresh();
      toast(t('toastUnfoldAll'));
    });

    $('langSwitch').addEventListener('click', async (event) => {
      const btn = event.target.closest('.lang-btn');
      if (!btn) return;
      settings.lang = btn.dataset.lang;
      CT_I18N.set(settings.lang);
      await chrome.storage.sync.set({ lang: settings.lang });
      await ask('ct:setSettings', { settings });
      localizeStatic();
      render(state);
    });

    $('exportBtn').addEventListener('click', exportCsv);
  }

  // ---------- CSV ----------

  function csvCell(value) {
    return `"${String(value).replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
  }

  async function exportCsv() {
    const res = await ask('ct:export');
    const rows = res && res.data ? res.data : null;
    if (!rows || !rows.length) {
      toast(t('toastNoData'), true);
      return;
    }

    const lines = [[t('csvIndex'), t('csvSender'), t('csvContent'), t('csvLength')].join(',')];
    for (const r of rows) {
      lines.push([r.index, csvCell(r.sender), csvCell(r.content), r.length].join(','));
    }
    lines.push('');
    lines.push([t('csvYours'), state ? state.user : ''].join(','));
    lines.push([t('csvAi'), state ? state.ai : ''].join(','));
    lines.push([t('csvTotal'), rows.length].join(','));
    lines.push([t('csvThread'), csvCell(state ? state.title : '')].join(','));

    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chattrrimer-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast(t('toastExported'));
  }

  // ---------- Khởi động ----------

  async function init() {
    settings = await readSettings();
    CT_I18N.set(settings.lang);
    $('version').textContent = `v${chrome.runtime.getManifest().version}`;
    localizeStatic();
    bind();
    await refresh();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

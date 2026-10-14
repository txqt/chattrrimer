/**
 * ChatTrimmer — popup logic
 * Bố cục "số ẩn là nhân vật chính": hero = số tin đang ẩn, cài đặt tự lưu.
 */
(() => {
  'use strict';

  const DEFAULTS = {
    isEnabled: true,
    maxVisible: 10,
    revealStep: 5,
    sites: { chatgpt: true, claude: true, grok: true, aistudio: true },
  };

  const $ = (id) => document.getElementById(id);

  let settings = { ...DEFAULTS, sites: { ...DEFAULTS.sites } };
  let statsData = null;
  let saveTimer = null;
  let toastTimer = null;

  // ---------- Hạ tầng ----------

  async function readSettings() {
    const saved = await chrome.storage.sync.get(DEFAULTS);
    return { ...DEFAULTS, ...saved, sites: { ...DEFAULTS.sites, ...(saved.sites || {}) } };
  }

  async function currentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab || null;
  }

  async function ask(type, payload) {
    const tab = await currentTab();
    if (!tab || !tab.id) return null;
    try {
      return await chrome.tabs.sendMessage(tab.id, { type, ...(payload || {}) });
    } catch {
      return null; // content script chưa chạy hoặc trang không được hỗ trợ
    }
  }

  function toast(message, isError) {
    const el = $('toast');
    el.textContent = message;
    el.className = `toast show${isError ? ' error' : ''}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = 'toast'; }, 1800);
  }

  function clampInt(value, min, max, fallback) {
    const n = parseInt(value, 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  // ---------- Form ----------

  function fillForm() {
    $('autoHideToggle').checked = settings.isEnabled;
    $('maxMessages').value = settings.maxVisible;
    $('showMoreCount').value = settings.revealStep;
    renderChips();
  }

  function renderChips() {
    document.querySelectorAll('.chip').forEach((chip) => {
      chip.classList.toggle('on', settings.sites[chip.dataset.site] !== false);
    });
  }

  function collectForm() {
    const sites = { ...settings.sites };
    document.querySelectorAll('.chip').forEach((chip) => {
      sites[chip.dataset.site] = chip.classList.contains('on');
    });
    return {
      isEnabled: $('autoHideToggle').checked,
      maxVisible: clampInt($('maxMessages').value, 10, 200, settings.maxVisible),
      revealStep: clampInt($('showMoreCount').value, 5, 50, settings.revealStep),
      sites,
    };
  }

  async function save() {
    settings = { ...settings, ...collectForm() };
    await chrome.storage.sync.set(settings);
    await ask('ct:setSettings', { settings });
    setTimeout(refresh, 250);
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 350);
  }

  function bindSettings() {
    $('autoHideToggle').addEventListener('change', () => {
      settings.isEnabled = $('autoHideToggle').checked;
      save();
    });

    for (const id of ['maxMessages', 'showMoreCount']) {
      $(id).addEventListener('input', scheduleSave);
      $(id).addEventListener('change', () => {
        const min = id === 'maxMessages' ? 10 : 5;
        const max = id === 'maxMessages' ? 200 : 50;
        $(id).value = clampInt($(id).value, min, max, settings[id === 'maxMessages' ? 'maxVisible' : 'revealStep']);
        save();
      });
    }

    $('platformChips').addEventListener('click', (event) => {
      const chip = event.target.closest('.chip');
      if (!chip) return;
      chip.classList.toggle('on');
      save();
    });
  }

  // ---------- Số liệu ----------

  async function refresh() {
    const res = await ask('ct:detailed');
    const data = res && res.data ? res.data : null;

    statsData = data;
    $('hiddenCount').textContent = data ? (data.hidden || 0) : 0;
    $('statUser').textContent = data ? data.totalUser : 0;
    $('statAi').textContent = data ? data.totalAi : 0;
    $('statTotal').textContent = data ? data.totalAll : 0;

    const tag = $('currentPlatform');
    if (data && data.platform) {
      tag.textContent = data.platform;
      tag.className = 'platform-tag ok';
    } else {
      tag.textContent = 'Không hỗ trợ';
      tag.className = 'platform-tag';
    }

    $('revealBtn').disabled = !data || !data.hidden;
  }

  // ---------- Hành động ----------

  function bindActions() {
    $('revealBtn').addEventListener('click', async () => {
      const res = await ask('ct:revealAll');
      if (!res) {
        toast('Chưa kết nối được trang', true);
        return;
      }
      await refresh();
      toast('Đã hiện tất cả tin nhắn');
    });

    $('refreshBtn').addEventListener('click', async () => {
      const btn = $('refreshBtn');
      btn.classList.add('spinning');
      await refresh();
      setTimeout(() => btn.classList.remove('spinning'), 350);
    });

    $('exportCsvBtn').addEventListener('click', exportCsv);
  }

  function csvCell(value) {
    return `"${String(value).replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
  }

  function exportCsv() {
    if (!statsData || !statsData.messages.length) {
      toast('Chưa có dữ liệu để xuất', true);
      return;
    }

    const rows = [['STT', 'Nguoi gui', 'Noi dung', 'Do dai'].join(',')];
    for (const m of statsData.messages) {
      rows.push([m.index, csvCell(m.sender), csvCell(m.content), m.length].join(','));
    }
    rows.push('');
    rows.push(['Tong tin cua ban', statsData.totalUser].join(','));
    rows.push(['Tong tin AI', statsData.totalAi].join(','));
    rows.push(['Tong cong', statsData.totalAll].join(','));
    rows.push(['Nen tang', statsData.platform].join(','));

    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chattrrimer-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast('Đã xuất file CSV');
  }

  // ---------- Khởi động ----------

  async function init() {
    settings = await readSettings();
    fillForm();
    bindSettings();
    bindActions();
    refresh();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

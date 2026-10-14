/**
 * ChatTrimmer — popup logic
 * Đọc/ghi cài đặt qua chrome.storage, giao tiếp với content script qua tabs.sendMessage.
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

  // ---------- Hạ tầng ----------

  async function readSettings() {
    const saved = await chrome.storage.sync.get(DEFAULTS);
    return { ...DEFAULTS, ...saved, sites: { ...DEFAULTS.sites, ...(saved.sites || {}) } };
  }

  async function saveSettings() {
    await chrome.storage.sync.set(settings);
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

  function status(message, kind) {
    const el = $('status');
    if (!el) return;
    el.textContent = message;
    el.className = `status ${kind || ''}`.trim();
    clearTimeout(status._t);
    status._t = setTimeout(() => {
      el.className = 'status';
      el.textContent = '';
    }, 2500);
  }

  // ---------- Tabs ----------

  function setTab(name) {
    document.querySelectorAll('.pill-tab').forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === name);
    });
    document.querySelectorAll('.tab-panel').forEach((p) => {
      p.classList.toggle('active', p.id === `${name}-tab`);
    });
  }

  function bindTabs() {
    document.querySelectorAll('.pill-tab').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const name = btn.dataset.tab;
        setTab(name);
        chrome.storage.sync.set({ activeTab: name });
        if (name === 'statistics') loadStatistics();
      });
    });
  }

  // ---------- Cài đặt ----------

  function fillForm() {
    $('autoHideToggle').checked = settings.isEnabled;
    $('maxMessages').value = settings.maxVisible;
    $('showMoreCount').value = settings.revealStep;
    document.querySelectorAll('.site-check').forEach((c) => {
      c.checked = settings.sites[c.dataset.site] !== false;
    });
  }

  function collectForm() {
    const maxVisible = parseInt($('maxMessages').value, 10);
    const revealStep = parseInt($('showMoreCount').value, 10);

    if (!Number.isFinite(maxVisible) || maxVisible < 10 || maxVisible > 200) {
      status('Số tin hiển thị phải trong khoảng 10–200', 'error');
      return null;
    }
    if (!Number.isFinite(revealStep) || revealStep < 5 || revealStep > 50) {
      status('Số tin "Show More" phải trong khoảng 5–50', 'error');
      return null;
    }

    const sites = { ...settings.sites };
    document.querySelectorAll('.site-check').forEach((c) => {
      sites[c.dataset.site] = c.checked;
    });

    return { isEnabled: $('autoHideToggle').checked, maxVisible, revealStep, sites };
  }

  function bindSettings() {
    $('saveBtn').addEventListener('click', async () => {
      const next = collectForm();
      if (!next) return;
      settings = { ...settings, ...next };
      await saveSettings();
      await ask('ct:setSettings', { settings });
      status('Đã lưu. Đang áp dụng…', 'success');
    });

    $('resetBtn').addEventListener('click', async () => {
      settings = { ...DEFAULTS, sites: { ...DEFAULTS.sites } };
      fillForm();
      await saveSettings();
      await ask('ct:setSettings', { settings });
      status('Đã đặt lại mặc định', 'success');
    });
  }

  // ---------- Nền tảng ----------

  async function refreshPlatform() {
    const res = await ask('ct:stats');
    const badge = $('currentPlatform');
    if (res && res.data && res.data.platform) {
      badge.textContent = res.data.platform;
      badge.className = 'badge badge-ok';
    } else {
      badge.textContent = 'Không hỗ trợ';
      badge.className = 'badge';
    }
  }

  // ---------- Thống kê ----------

  function placeholder(text) {
    return `<div class="loading-placeholder">${text}</div>`;
  }

  async function loadStatistics() {
    $('totalUserMessages').textContent = '…';
    $('totalAiMessages').textContent = '…';
    $('totalAllMessages').textContent = '…';
    $('messagesList').innerHTML = placeholder('Đang tải…');

    const res = await ask('ct:detailed');
    if (!res || !res.data) {
      renderStats({ totalUser: 0, totalAi: 0, totalAll: 0, messages: [] }, 'Hãy tải lại trang chat rồi mở lại popup');
      return;
    }
    statsData = res.data;
    renderStats(res.data);
  }

  function renderStats(data, emptyText) {
    $('totalUserMessages').textContent = data.totalUser;
    $('totalAiMessages').textContent = data.totalAi;
    $('totalAllMessages').textContent = data.totalAll;

    if (!data.messages.length) {
      $('messagesList').innerHTML = placeholder(emptyText || 'Không tìm thấy tin nhắn nào');
      return;
    }

    $('messagesList').innerHTML = data.messages
      .map((m) => `
        <div class="message-item" data-id="${m.id}" title="Nhảy tới tin nhắn">
          <div class="message-header">
            <span class="message-sender ${m.isUser ? '' : 'ai'}">${escapeHtml(m.sender)}</span>
            <span class="message-time">#${m.index}</span>
          </div>
          <div class="message-content">${escapeHtml(m.preview)}</div>
        </div>`)
      .join('');

    $('messagesList').querySelectorAll('.message-item').forEach((item) => {
      item.addEventListener('click', () => goTo(item.dataset.id));
    });
  }

  async function goTo(id) {
    const res = await ask('ct:goto', { id });
    if (res && res.found) {
      window.close();
    } else {
      status('Không tìm thấy tin nhắn này', 'error');
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  }

  function csvCell(value) {
    return `"${String(value).replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
  }

  function exportCsv() {
    if (!statsData || !statsData.messages.length) {
      status('Chưa có dữ liệu để xuất', 'error');
      return;
    }

    const rows = [['STT', 'Người gửi', 'Nội dung', 'Độ dài'].join(',')];
    for (const m of statsData.messages) {
      rows.push([m.index, csvCell(m.sender), csvCell(m.content), m.length].join(','));
    }
    rows.push('');
    rows.push(['Tổng tin của bạn', statsData.totalUser].join(','));
    rows.push(['Tổng tin AI', statsData.totalAi].join(','));
    rows.push(['Tổng cộng', statsData.totalAll].join(','));
    rows.push(['Nền tảng', statsData.platform].join(','));

    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chattrrimer-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    status('Đã xuất file CSV', 'success');
  }

  // ---------- Khởi động ----------

  async function init() {
    $('versionLabel').textContent = `v${chrome.runtime.getManifest().version}`;

    settings = await readSettings();
    fillForm();
    bindTabs();
    bindSettings();
    $('exportCsvBtn').addEventListener('click', exportCsv);

    const { activeTab } = await chrome.storage.sync.get({ activeTab: 'settings' });
    setTab(activeTab === 'statistics' ? 'statistics' : 'settings');
    if (activeTab === 'statistics') loadStatistics();

    refreshPlatform();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

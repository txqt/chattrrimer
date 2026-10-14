/**
 * ChatTrimmer — popup logic (Concept 5: Thread Accordion)
 */
(() => {
  'use strict';

  const DEFAULTS = { isEnabled: true, maxVisible: 30 };

  const $ = (id) => document.getElementById(id);

  let settings = { ...DEFAULTS };
  let state = null;
  let saveTimer = null;
  let toastTimer = null;

  // ---------- Hạ tầng ----------

  async function readSettings() {
    const saved = await chrome.storage.sync.get(DEFAULTS);
    return { ...DEFAULTS, ...saved };
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
      return null; // chưa có content script / trang không hỗ trợ
    }
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

    $('statePill').textContent = enabled ? 'Active' : 'Off';
    $('statePill').classList.toggle('off', !enabled);
    $('headSub').textContent = enabled ? 'Đang gấp tin nhắn cũ' : 'Đang tắt';
    $('statusDot').style.background = enabled ? 'var(--ok)' : 'var(--text-faint)';

    $('tailValue').textContent = `${settings.maxVisible} tin`;
    $('tailRange').value = settings.maxVisible;

    if (!data) {
      $('threadTitle').textContent = 'Không hỗ trợ';
      $('headSub').textContent = 'Mở một cuộc trò chuyện trên chatgpt.com rồi thử lại';
      $('foldCount').textContent = '0 folds';
      $('folds').innerHTML = '<div class="empty">Không tìm thấy cuộc trò chuyện nào</div>';
      $('tailCount').textContent = '0';
      $('tailDesc').textContent = 'Chưa có dữ liệu.';
      $('unfoldMeta').textContent = '(0 tin)';
      $('unfoldAllBtn').disabled = true;
      $('statUser').textContent = 'Bạn: 0 (0%)';
      $('statAi').textContent = 'ChatGPT: 0 (0%)';
      return;
    }

    $('threadTitle').textContent = data.title || 'ChatGPT';
    $('tailCount').textContent = data.tail;
    $('foldCount').textContent = `${data.folds.length} folds`;
    $('unfoldMeta').textContent = `(${data.hidden} tin)`;
    $('unfoldAllBtn').disabled = data.hidden === 0;
    $('statUser').textContent = `Bạn: ${data.user} (${pct(data.user, data.total)}%)`;
    $('statAi').textContent = `ChatGPT: ${data.ai} (${pct(data.ai, data.total)}%)`;

    $('tailDesc').textContent = data.hidden
      ? `${data.hidden} tin cũ hơn đang được gấp lại. Trang cuộn tức thì.`
      : 'Không có tin nào bị gấp. Cuộc trò chuyện đang ở trạng thái gọn.';

    renderFolds(data.folds);
  }

  function renderFolds(folds) {
    const box = $('folds');
    if (!folds.length) {
      box.innerHTML = '<div class="empty">Không có tin nào bị gấp</div>';
      return;
    }
    box.innerHTML = folds
      .map((f, i) => `
        <div class="fold-row">
          <div class="fold-left">
            <span class="fold-index">${i + 1}</span>
            <div class="fold-info">
              <div class="fold-range">
                <span>Tin ${f.from} — ${f.to}</span>
                <span class="fold-tag">Folded</span>
              </div>
              <div class="fold-desc" title="${escapeAttr(f.preview)}">${escapeHtml(f.preview)}</div>
            </div>
          </div>
          <button class="fold-expand" data-from="${f.from}" data-to="${f.to}" type="button">Expand</button>
        </div>`)
      .join('');

    box.querySelectorAll('.fold-expand').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const from = Number(btn.dataset.from);
        const to = Number(btn.dataset.to);
        const res = await ask('ct:unfoldFold', { from, to });
        if (!res) { toast('Chưa kết nối được trang', true); return; }
        await refresh();
        toast(`Đã mở tin ${from} — ${to}`);
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
      $('tailValue').textContent = `${settings.maxVisible} tin`;
      scheduleSave();
    });

    $('unfoldAllBtn').addEventListener('click', async () => {
      const res = await ask('ct:unfoldAll');
      if (!res) { toast('Chưa kết nối được trang', true); return; }
      await refresh();
      toast('Đã mở toàn bộ cuộc trò chuyện');
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
      toast('Chưa có dữ liệu để xuất', true);
      return;
    }

    const lines = [['STT', 'Nguoi gui', 'Noi dung', 'Do dai'].join(',')];
    for (const r of rows) {
      lines.push([r.index, csvCell(r.sender), csvCell(r.content), r.length].join(','));
    }
    lines.push('');
    lines.push(['Tong tin cua ban', state ? state.user : ''].join(','));
    lines.push(['Tong tin ChatGPT', state ? state.ai : ''].join(','));
    lines.push(['Tong cong', rows.length].join(','));
    lines.push(['Ho so', state ? state.title : ''].join(','));

    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
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
    bind();
    await refresh();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

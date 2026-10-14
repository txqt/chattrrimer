/**
 * ChatTrimmer — i18n runtime
 * Cho phép đổi ngôn ngữ ngay trong popup (không phụ thuộc ngôn ngữ trình duyệt).
 * _locales/ chỉ còn giữ tên + mô tả cho Chrome; toàn bộ chuỗi UI nằm ở đây.
 */
(function (global) {
  'use strict';

  const MESSAGES = {
    en: {
      stateActive: 'Active',
      stateOff: 'Off',
      headFolding: 'Folding old messages',
      headOff: 'Turned off',
      labelFoldMap: 'Conversation Fold Map',
      labelTailSize: 'Tail Window Size',
      foldsCount: '$1 folds',
      tagFolded: 'Folded',
      tagVisible: 'Visible',
      actionExpand: 'Expand',
      actionExportCsv: 'Export CSV',

      headTail: 'Active Tail: last $1 messages',
      tailDescHidden: '$1 older messages are folded away. Scrolling stays instant.',
      tailDescNone: 'Nothing is folded. The conversation is already neat.',
      unfoldAll: 'Unfold entire conversation',
      unfoldMeta: '($1 messages)',

      stepperValue: '$1 messages',
      scaleCompact: 'Compact (10)',
      scaleStandard: 'Standard (30)',
      scaleWide: 'Wide (100)',

      statYou: 'You: $1 ($2%)',
      statAi: 'ChatGPT: $1 ($2%)',

      foldRange: 'Messages $1 — $2',
      emptyNoFolds: 'Nothing is folded',
      emptyNoConversation: 'No conversation found',
      unsupportedTitle: 'Unsupported',
      unsupportedSub: 'Open a conversation on chatgpt.com and try again',
      footLabel: 'Auto-trimming:',

      toastUnfolded: 'Unfolded messages $1 — $2',
      toastUnfoldAll: 'Entire conversation unfolded',
      toastNoData: 'Nothing to export yet',
      toastExported: 'CSV exported',
      toastNoConnection: "Can't reach the page",

      contentOpen: 'Unfold $1 · $2 folded',
      senderYou: 'You',

      csvIndex: 'No.',
      csvSender: 'Sender',
      csvContent: 'Content',
      csvLength: 'Length',
      csvYours: 'Your messages',
      csvAi: 'ChatGPT messages',
      csvTotal: 'Total',
      csvThread: 'Thread',
    },

    vi: {
      stateActive: 'Bật',
      stateOff: 'Tắt',
      headFolding: 'Đang gấp tin nhắn cũ',
      headOff: 'Đang tắt',
      labelFoldMap: 'Bản đồ gấp',
      labelTailSize: 'Cỡ cửa sổ tin cuối',
      foldsCount: '$1 khối',
      tagFolded: 'Đã gấp',
      tagVisible: 'Hiển thị',
      actionExpand: 'Mở',
      actionExportCsv: 'Xuất CSV',

      headTail: 'Active Tail: $1 tin cuối',
      tailDescHidden: '$1 tin cũ hơn đang được gấp lại. Trang cuộn tức thì.',
      tailDescNone: 'Không có tin nào bị gấp. Cuộc trò chuyện đang ở trạng thái gọn.',
      unfoldAll: 'Mở toàn bộ cuộc trò chuyện',
      unfoldMeta: '($1 tin)',

      stepperValue: '$1 tin',
      scaleCompact: 'Gọn (10)',
      scaleStandard: 'Chuẩn (30)',
      scaleWide: 'Rộng (100)',

      statYou: 'Bạn: $1 ($2%)',
      statAi: 'ChatGPT: $1 ($2%)',

      foldRange: 'Tin $1 — $2',
      emptyNoFolds: 'Không có tin nào bị gấp',
      emptyNoConversation: 'Không tìm thấy cuộc trò chuyện nào',
      unsupportedTitle: 'Không hỗ trợ',
      unsupportedSub: 'Mở một cuộc trò chuyện trên chatgpt.com rồi thử lại',
      footLabel: 'Tự động gấp:',

      toastUnfolded: 'Đã mở tin $1 — $2',
      toastUnfoldAll: 'Đã mở toàn bộ cuộc trò chuyện',
      toastNoData: 'Chưa có dữ liệu để xuất',
      toastExported: 'Đã xuất file CSV',
      toastNoConnection: 'Chưa kết nối được trang',

      contentOpen: 'Mở $1 tin · $2 đang gấp',
      senderYou: 'Bạn',

      csvIndex: 'STT',
      csvSender: 'Nguoi gui',
      csvContent: 'Noi dung',
      csvLength: 'Do dai',
      csvYours: 'Tong tin cua ban',
      csvAi: 'Tong tin ChatGPT',
      csvTotal: 'Tong cong',
      csvThread: 'Ho so',
    },
  };

  const LANGS = ['en', 'vi'];
  let current = null;

  function detect() {
    let ui = '';
    try {
      ui = (global.chrome && chrome.i18n && chrome.i18n.getUILanguage && chrome.i18n.getUILanguage()) || '';
    } catch {
      ui = '';
    }
    if (!ui) ui = global.navigator ? global.navigator.language || '' : '';
    return ui.toLowerCase().startsWith('vi') ? 'vi' : 'en';
  }

  function resolve(pref) {
    return LANGS.includes(pref) ? pref : detect();
  }

  function set(pref) {
    current = resolve(pref);
    return current;
  }

  function lang() {
    return current || (current = detect());
  }

  function t(key, subs) {
    const dict = MESSAGES[lang()] || MESSAGES.en;
    let msg = dict[key] != null ? dict[key] : MESSAGES.en[key];
    if (msg == null) return key;

    if (subs != null) {
      const list = Array.isArray(subs) ? subs : [subs];
      list.forEach((value, i) => {
        msg = msg.split(`$${i + 1}`).join(String(value));
      });
    }
    return msg;
  }

  global.CT_I18N = { set, t, resolve, detect, lang, LANGS };
})(typeof window !== 'undefined' ? window : self);

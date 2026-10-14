# ChatTrimmer

Gấp tin nhắn cũ trong **ChatGPT** để cuộc trò chuyện dài không còn lag. Tin bị gấp vẫn nằm trong trang, mở lại bất cứ lúc nào.

## Tính năng

- **Gấp tin cũ**: chỉ giữ lại N tin gần nhất, phần cũ hơn được gấp lại khỏi giao diện.
- **Conversation Fold Map**: xem phần đã gấp chia thành từng khối và **mở riêng từng khối**.
- **Mở toàn bộ**: một nút trả lại toàn bộ cuộc trò chuyện.
- **Tail Window Size**: thanh trượt chỉnh số tin giữ lại (10–100).
- **Thống kê người gửi**: tỉ lệ tin của bạn so với ChatGPT.
- **Xuất CSV** toàn bộ cuộc trò chuyện.
- **Nút "Mở … tin"** ngay trên trang khi có tin đang bị gấp.

## Nền tảng

Chỉ **ChatGPT** (`chatgpt.com`, `chat.openai.com`). Các nền tảng khác chưa hỗ trợ.

## Cài đặt (load unpacked)

1. Tải repository này về máy.
2. Mở `chrome://extensions/`.
3. Bật **Developer mode**.
4. Chọn **Load unpacked** → trỏ tới thư mục extension.
5. Mở một cuộc trò chuyện trên ChatGPT và tải lại trang.

## Cấu trúc

```
manifest.json         # Manifest V3 (chỉ host ChatGPT)
popup.html / .css     # Giao diện popup — "Thread Accordion"
src/popup.js          # Logic popup (fold map, thống kê, CSV)
src/content.js        # Content script: gấp/mở tin nhắn trên trang
styles.css            # Style chèn vào trang (class ẩn, nút trên trang)
fonts/                # Plus Jakarta Sans + JetBrains Mono (OFL), bundle sẵn
icons/                # Icon 16/48/128
STITCH-PROMPT.md      # Prompt thiết kế UI
```

## Ghi chú kỹ thuật

- Font được **bundle trong `fonts/`** vì extension MV3 không nạp được font từ CDN.
- Không dùng thư viện ngoài; toàn bộ CSS/JS viết tay.
- Kích thước một fold cố định 50 tin (`FOLD_SIZE` trong `src/content.js`).

## License

MIT — xem [LICENSE](LICENSE).

# ChatTrimmer

Giữ cuộc trò chuyện AI nhẹ và mượt — tự động ẩn bớt tin nhắn cũ trong khung chat để trang đỡ lag, kèm nút hiện thêm khi cần xem lại.

## Tính năng

- **Tự động ẩn tin cũ**: chỉ giữ N tin gần nhất, phần cũ hơn bị ẩn khỏi giao diện (vẫn còn trong DOM, không mất dữ liệu).
- **Nút "hiện thêm"**: hiện dần số tin bị ẩn ngay trên trang.
- **Thống kê**: đếm tin của bạn / tin AI / tổng, danh sách tin nhắn, bấm để nhảy tới, xuất CSV.
- **Bật/tắt theo từng nền tảng**.

## Nền tảng hỗ trợ

| Nền tảng | Trạng thái |
|---|---|
| ChatGPT (chatgpt.com) | Ổn định |
| Google AI Studio | Beta |
| Claude | Beta |
| Grok | Beta |

> Các nền tảng "Beta" dùng selector chưa kiểm chứng đầy đủ; nếu DOM của họ đổi, có thể cần cập nhật lại.

## Cài đặt (load unpacked)

1. Tải repository này về máy.
2. Mở `chrome://extensions/`.
3. Bật **Developer mode**.
4. Chọn **Load unpacked** → trỏ tới thư mục extension.
5. Mở một trang chat AI và tải lại trang.

## Cấu hình

Trong popup, tab **Cài đặt**:

- Bật/tắt tự động ẩn.
- Số tin nhắn hiển thị: 10–200.
- Số tin mỗi lần "hiện thêm": 5–50.
- Chọn nền tảng áp dụng.

Tab **Thống kê**: xem số liệu, danh sách tin nhắn, xuất CSV.

## Cấu trúc

```
manifest.json        # Manifest V3
popup.html/.css      # Giao diện popup
src/popup.js         # Logic popup (settings + thống kê)
src/content.js       # Content script: ẩn/hiện tin nhắn trên trang chat
styles.css           # Style chèn vào trang (class ẩn, nút hiện thêm)
icons/               # Icon 16/48/128
```

## License

MIT — xem [LICENSE](LICENSE).

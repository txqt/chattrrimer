# Prompt cho Google Stitch — ChatTrimmer popup

Copy nguyên khối trong fence bên dưới, dán vào ô prompt của Stitch.

---

## Prompt đầy đủ (khuyên dùng)

```text
Design a dark, premium browser-extension popup UI for "ChatTrimmer" — a small tool
that hides old messages in AI chat threads (ChatGPT, Claude, Grok, Google AI Studio)
to reduce lag. The screen must feel like a consumer-fintech product: calm, airy,
mostly near-black, with a single soft glow as the only decoration.

FRAME
- Browser extension popup, 360px wide, ~600px tall, dark background.
- One single screen. No tabs, no sidebar, no navigation bars.
- Generous negative space around the big number at the top.

VISUAL LANGUAGE (Affirm-inspired, dark)
- Canvas / background: #101820 (indigo-black, never pure #000)
- Elevated surface: #0c0c14 (cards) / #1b1b30 (glass, chips, tracks)
- Text: primary #ffffff, secondary #9f9f9f, caption #6d6e71
- Periwinkle glow #9cadfc: used ONLY as a soft radial halo behind the hero number,
  and as the hover fill of the primary button. Never as the default fill of a button.
- Indigo #4a4af4: reserved for focus rings only.
- Tag pill colors: background #e2e2ff, text #212189.
- Corner radii: cards 24px, text inputs 4px, all buttons and pills 96px (full pill).
- Depth: NO gray drop shadows anywhere. Depth comes from a soft periwinkle glow
  (box-shadow rgba(168,169,252,0.25), 0 0 12px) and from color, not shadow.
- Typography: Inter. The big hero number is thin (font-weight 300). Body 400.
  Labels and buttons 500. Small captions 12px.

LAYOUT (top to bottom)
1. Top bar
   - Left: a 30px round white badge with the letters "CT" in dark indigo, next to the
     wordmark "ChatTrimmer" (16px, thin weight 300, white).
   - Right: a 34px circular ghost icon button with a refresh arrow, 1px subtle white border.
2. Hero
   - Centered giant number "37", 56px, thin weight 300, pure white.
   - Behind it a soft round periwinkle radial halo (#9cadfc fading to transparent).
   - Under the number a tiny caption in #9f9f9f: "tin đang được ẩn".
3. Primary actions (one row, two full-pill buttons, 48px tall)
   - Primary: white background, text "Hiện hết" in #101820, weight 500. Higher flex.
   - Secondary: transparent background, 1px white border, white text "Xuất CSV".
4. Divider
   - A 1px horizontal hairline made of a left-to-right indigo gradient:
     transparent → #4a4af4 (50%) → transparent.
5. Settings panel (rows stacked, each separated by the same indigo gradient hairline)
   - Row: left "Tự động ẩn" (white, 15px, weight 500) over a helper
     "Ẩn tin cũ để trang nhẹ hơn" (#9f9f9f, 14px); right: an iOS-style toggle,
     ON state = white track with a dark #101820 knob.
   - Row: "Giữ lại" + helper "Số tin gần nhất hiển thị (10–200)"; a full-width white
     number input below, 48px tall, 4px radius, dark text, showing "10".
   - Row: "Show More" + helper "Số tin hiện thêm mỗi lần (5–50)"; same white number
     input showing "5".
   - Row: "Nền tảng" + helper "Bật/tắt nơi ChatTrimmer hoạt động"; a wrapping row of
     four pill chips: ChatGPT, Claude, Grok, AI Studio. Active chip = pale indigo
     (#e2e2ff background, #212189 text). Inactive chip = dark glass (#1b1b30
     background, #9f9f9f text).
6. Footer
   - Left: a small stats line "18 bạn · 19 AI · 37 tổng" (#6d6e71, numbers in white).
   - Right: a rounded tag showing the detected platform "ChatGPT" in the pale indigo
     tag style (#e2e2ff / #212189).

STATES TO SHOW
- A small pill toast near the bottom: "Đã hiện tất cả tin nhắn", periwinkle background
  with dark text.
- Unsupported-site state: hero number shows "0" and the footer tag reads "Không hỗ trợ"
  in a neutral dark glass pill instead of pale indigo.

CONSTRAINTS
- Dark theme only. No light mode.
- No gray drop shadows, no glassmorphism blur on cards, no gradients other than the
  hero halo and the 1px indigo hairlines.
- Never fill the primary button with indigo #4a4af4 — the primary pill is white.
- Keep it minimal: one accent, one glow, lots of dark space.
```

---

## Prompt ngắn (để Stitch nhả nhiều biến thể nhanh)

```text
A 360px browser-extension popup, dark consumer-fintech style, indigo-black #101820 canvas.
Top bar: round white "CT" badge + "ChatTrimmer" wordmark (thin) + circular ghost refresh button.
Hero: huge thin-weight white number "37" centered on a soft periwinkle #9cadfc radial glow,
caption "tin đang được ẩn" in #9f9f9f.
Two full-pill buttons: white "Hiện hết" (dark text) and ghost "Xuất CSV" (1px white border).
Then a 1px indigo-gradient hairline, then settings rows separated by the same hairline:
toggle "Tự động ẩn", white 48px number inputs for "Giữ lại" (10) and "Show More" (5),
and four pill chips ChatGPT / Claude / Grok / AI Studio (active = #e2e2ff bg + #212189 text,
inactive = #1b1b30 bg + #9f9f9f text).
Footer: "18 bạn · 19 AI · 37 tổng" plus a pale indigo "ChatGPT" tag.
Radii: cards 24px, inputs 4px, pills 96px. Depth = periwinkle glow rgba(168,169,252,.25),
no gray shadows. Font Inter, hero number weight 300, labels 500.
```

---

## Mẹo dùng Stitch

1. Chạy prompt ngắn trước để lấy 3–4 biến thể bố cục, chọn cái ưng.
2. Sau đó dùng prompt đầy đủ để "chốt" chi tiết màu/radius/type trên biến thể đã chọn.
3. Stitch hay vẽ dư shadow xám và tô nút bằng màu accent — nhắc lại câu
   "no gray shadows, primary button stays white" nếu nó làm sai.
4. Muốn thêm màn hình khác (trang Options, onboarding) thì nói rõ
   "same design system, 480px wide options page with two columns".

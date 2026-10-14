# Prompt cho Google Stitch — ChatTrimmer popup

Hai chế độ:
- **Prompt mở** — giao toàn quyền sáng tạo cho Stitch, chỉ chốt bài toán. Dùng khi muốn phá lối mòn.
- **Prompt đầy đủ (Affirm)** — khoá cứng bố cục + màu theo DESIGN.md. Dùng khi cần khớp bản đang chạy.

---

## 1. Prompt MỞ (không giới hạn) — khuyên dùng khi muốn ý mới

```text
You have full creative freedom. Do not copy any existing design system — invent one.

PRODUCT
ChatTrimmer is a tiny Chrome extension that makes long AI chat threads feel light
again. People who use ChatGPT, Claude, Grok or Google AI Studio every day end up with
conversations hundreds of messages long, and the page turns sluggish. ChatTrimmer
quietly hides the older messages so the thread stays fast, and lets you bring them back
when you need them. It should feel like a quiet utility you trust — not a toy, not a
dashboard product, not a marketing page.

WHAT THE USER MUST BE ABLE TO DO IN THE POPUP
- Instantly see how many messages are currently hidden.
- Bring the hidden messages back.
- Change how aggressively it trims (how many recent messages stay visible).
- Turn the tool on/off, and pick which AI sites it works on.
- Get a rough sense of thread size (how many messages are theirs vs the AI's).
- Export the conversation to CSV.

FREEDOM
Everything else is yours: layout, navigation model, information hierarchy, color,
typography, iconography, illustration, motion — dark, light, or both. You may drop the
tabs, add tabs, use one scrollable surface, a stepper, a status ring, a canvas, a mini
dashboard — anything. You may ignore the idea of a big "hidden count" number entirely.
Surprise me. Avoid the default "settings list" look that almost every extension popup has.

WHAT TO RETURN
Five clearly different directions, not five variations of one. For each: a name, one
line on the concept, and the screen. Make at least one direction dramatically minimal
and at least one dense and data-rich.

THE ONLY FIXED THINGS
- It is a Chrome extension popup: roughly 320–400px wide, variable height.
- It is opened for a few seconds at a time; the real question in the user's head is
  "is my chat OK, and can I get my old messages back?".
- No login. No onboarding wizard. No marketing copy.
```

### Prompt mở, bản ngắn

```text
Invent a fresh UI for a Chrome extension popup called ChatTrimmer. It hides old
messages in long AI chats (ChatGPT/Claude/Grok/AI Studio) so the thread stays fast,
and lets you bring them back. In the popup the user must: see how many messages are
hidden, restore them, set how many recent messages to keep, toggle the tool on/off,
pick supported sites, see a rough their-messages vs AI-messages count, and export CSV.

No design system, no reference UI — you decide everything: layout, navigation, color,
type, density, motion, dark or light. Ignore the usual "settings list" popup look.
Popup only, ~360px wide. Give me 5 genuinely different directions with names.
```

### Gợi ý "mood" để Stitch đổi hướng (ghép vào prompt mở)

Chọn 1–2 câu, không cần hết:

```text
- Make it feel like a physical instrument: one big dial/ring the user turns.
- Make it feel like a health check: calm, reassuring, "your thread is healthy".
- Make it feel editorial: oversized type, quiet, almost a magazine page.
- Make it feel like a control room: dense, monospaced numbers, everything visible at once.
- Make it feel soft and human: rounded, playful, a little character living in the corner.
```

---

## 2. Prompt đầy đủ (hệ Affirm, có ràng buộc)

Dùng khi cần Stitch ra đúng bản đang chạy: bố cục "hero number", dark indigo-black,
glow periwinkle.

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

## Mẹo dùng Stitch

1. Stitch ra nhiều biến thể — chạy **prompt mở** trước để lấy hướng, rồi mới siết bằng
   prompt có ràng buộc (hoặc ghép thêm mục "mood").
2. Stitch hay tự thêm shadow xám, tô nút bằng màu accent, và bôi gradient khắp nơi.
   Nếu không muốn thì nhắc lại đúng câu phủ định tương ứng.
3. Muốn màn hình khác (trang Options, onboarding) thì thêm
   "same design language, 480px wide options page, two columns".

# Ishaara (React) — Final Web + WebView Build

A lightweight, mobile-friendly web app that converts speech or typed text into Indian Sign Language (ISL) gestures using a 3D avatar. This is the final React implementation produced during Smart India Hackathon 2025 and is tailored for embedding into Android WebViews.

✅ **Status:** Final / Ready for WebView embedding

---

## Quick features

- Speech-to-sign using the Web Speech API (mic permission required)
- Text-to-sign conversion with single-click animation playback
- Learn mode with an interactive alphabet keyboard
- 3D avatar animations (Three.js) with tuned speed and pause controls
- Small, responsive UI optimized for mobile screens and WebView
- In-page switch buttons to toggle between **Convert** and **Learn** (no top nav required)

---

## Tech stack

- React + Vite
- React Router DOM
- TypeScript
- Tailwind CSS
- Three.js for 3D avatar rendering

---

## Getting started (development)

1. Clone and install:

```bash
git clone https://github.com/RanitManik/ishaara-react.git
cd ishaara-react
npm install
```

2. Run dev server:

```bash
npm run dev
```

3. Open the app at http://localhost:5173

Note: Use a modern browser (Chromium, Chrome, or WebView with proper permission handling) to test microphone features.

---

## Building for production (WebView-ready)

1. Build the production bundle:

```bash
npm run build
```

2. Preview the production build locally (optional):

```bash
npm run preview
```

3. The output folder (by default `dist`) contains the static files ready to be embedded into an Android app's `assets` or served from a static hosting provider.

---

## Android WebView notes

- See `ANDROID_GUIDE.md` for full details. Key reminders:
  - Enable JavaScript and DOM storage in your WebView.
  - Request and handle microphone permission (`RECORD_AUDIO`).
  - Some WebView versions may require explicit `getUserMedia` handling; test on your target Android API levels.

Example WebView setup (Java):

```java
WebView webView = findViewById(R.id.webview);
webView.getSettings().setJavaScriptEnabled(true);
webView.getSettings().setDomStorageEnabled(true);
webView.loadUrl("file:///android_asset/index.html");
```

---

## How to use

- Convert: Tap the mic to speak or type text, then press "Convert to Sign Language". The avatar will animate the signs.
- Learn: Type letters on the screen keyboard and press Enter to see the avatar perform the signs. Use the "Switch" button at the bottom to toggle pages while testing in a browser.

---

## Supported words & example sentences

**Built-in words (word-level gestures):**

- HOME
- PERSON
- TIME
- YOU
- NAMASTE
- HELLO
- GOODBYE
- THANK_YOU
- YES
- NO

**Alphabet support:** A–Z (each letter has its own gesture; Learn mode is ideal for spelling and practice).

**Example sentences (use these or similar short phrases):**

- HELLO PERSON, THANK YOU
- NAMASTE, YOU HOME?
- NO TIME, GOODBYE
- YES, TIME HOME
- YOU PERSON? YES/NO
- THANK YOU, GOODBYE YOU
- NO HOME, NO TIME

> [!NOTE]
> Words that are not available as pre-built word animations will be spelled out letter-by-letter using the alphabet gestures.
> For best results keep sentences short and separate words with spaces or commas.

---

## Project structure

- `src/pages/` — `Convert`, `Learn` pages
- `src/components/` — UI components and small widgets
- `src/hooks/` — avatar renderer and helpers
- `src/lib/Animations/` — encoded animation sequences per alphabet/word

---

## Notes & Troubleshooting

- Microphone: Browsers require user gesture and permissions; on Android WebView you must request `RECORD_AUDIO` at runtime.
- WebView: If audio permissions or getUserMedia behaves differently on your device, refer to `ANDROID_GUIDE.md` for workarounds.
- If you see layout issues on very small screens, try increasing viewport height or testing with `max-w-md` container constraints (app is optimized for small-width mobile screens).


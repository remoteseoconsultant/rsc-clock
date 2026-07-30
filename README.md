# RSC Clock — Browser Toolbar Clock Extension

A lightweight **browser toolbar clock extension** for Chrome and Firefox. Click the toolbar icon to see the time — locally and across up to two other timezones — in either a digital or fully-numbered analog view, styled the way you want.

## Features

- **Digital & Analog views** — switch between a digital readout and an analog clock face with all 12 numbers shown (no dots, no minimalist markers)
- **World clock** — add two extra timezone slots alongside your local time
- **12 / 24-hour format** toggle, with AM/PM
- **Seconds on/off** toggle
- **Light / Dark / Auto** theme, following your system preference
- **Custom colors** — quick-pick swatches for background and clock color
- **Custom fonts** for the clock display (Roboto Mono, Orbitron, Share Tech Mono, or system default)
- Settings sync via the browser's built-in `storage.sync` — no account, no external server, no tracking

## Install

### Chrome / Edge / Brave (Chromium)
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the [`chrome-extensions/rsc-clock`](chrome-extensions/rsc-clock) folder

### Firefox
1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…**
3. Select `manifest.json` inside [`firefox-addons/rsc-clock`](firefox-addons/rsc-clock)

## Why this extension

Most toolbar clock extensions are either bare-bones (no world clock, no styling) or bloated with permissions and trackers. RSC Clock asks for only the `storage` permission, runs entirely client-side, and focuses on doing one thing well: showing the time, exactly how you like it.

## License

All rights reserved — see [LICENSE](LICENSE). Source is public for review and reference, not for reuse or redistribution.

## Author

Built by **[Md. Istiqur Rahman](https://remoteseoconsultant.com)** — Remote SEO Consultant for SaaS & eCommerce, and Remote GTM Manager for Solopreneurs & Entrepreneurs.

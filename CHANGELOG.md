# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-05

### Added

- Initial release of Neiki's QR.
- Web Component with Shadow DOM isolation for CSS-conflict-free embedding.
- A from-scratch, dependency-free QR Code encoder implementing ISO/IEC 18004 (versions 1-40, error correction levels L/M/Q/H, Reed-Solomon error correction, automatic version and mask-pattern selection).
- Combined generator/scanner UI in a single `<neiki-qr>` element, switchable via the `data-mode="generate"` / `data-mode="scan"` attribute.
- Thirteen guided QR content types for generation: Text, URL, Wi-Fi, Email, Phone, SMS, WhatsApp, Contact (vCard 3.0), Calendar Event (iCalendar), Location (geo URI), SEPA payment (EPC/BCD), Czech QR payment (SPD 1.0), and Bitcoin payment URIs.
- PNG and SVG export of generated QR codes, plus `toDataURL()` and clipboard copy of the encoded value.
- Live camera scanning and image-upload scanning powered by the browser's native `BarcodeDetector` API, with camera switching, torch/flashlight toggle where supported, scan history, and a friendly fallback message on unsupported browsers.
- Built-in translations for English, Czech, German, Spanish, French, Polish, Slovak and Ukrainian, selectable via the `lang` attribute or `setLang()`, extensible with `addTranslations()`.
- Light, dark and auto (`prefers-color-scheme`) themes.
- Cancelable `scan` event plus `ready`, `mode-change`, `change`, `render`, `error`, `scan-start` and `scan-stop` events for integrating with a host application.
- CSS variable customization with a consistent `--nqr-*` prefix.
- `minify.py` build script that embeds the component's CSS directly into `dist/neiki-qr.js` and `dist/neiki-qr.min.js`, so a single script tag is enough at runtime; standalone `dist/neiki-qr.css` and `.min.css` are also produced for reference.

[1.0.0]: https://github.com/neikiri/neiki-qr/releases/tag/1.0.0

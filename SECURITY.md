# Security Policy

## Supported Versions

Only the latest published release of Neiki's QR receives security fixes.

| Version | Supported |
| --- | --- |
| 1.x | ✅ |
| < 1.0 | ❌ |

## Reporting a Vulnerability

Please do not open a public GitHub issue for security vulnerabilities.

Instead, report it privately by emailing **neikiri@neikiri.dev** with:

- A description of the vulnerability and its potential impact
- Steps to reproduce it, including a minimal example if possible
- The affected version(s)

You should receive an initial response within **72 hours**. We will keep you updated as the issue is investigated and fixed, and will credit you in the release notes unless you prefer to stay anonymous.

## Scope

This policy covers the code in this repository (`src/`, `dist/`, `demo/`, `minify.py`). It does not cover:

- The content of QR codes a host application chooses to generate or scan with the component.
- Third-party CDNs or package registries used to distribute the built files.
- The browser's own `BarcodeDetector` or `getUserMedia` implementations.

## Security Design Notes

- The component renders inside a Shadow DOM, isolating its markup and styles from the host page.
- All dynamic text (form input, scan results, translations) is inserted via `textContent` or HTML-escaped before being placed in markup — user-supplied values cannot inject markup into the DOM.
- The QR encoder runs entirely client-side and performs no network requests. Scanning uses the browser's native `BarcodeDetector` API against a local camera stream or a locally selected image file — no frame or image data is ever uploaded anywhere by the component.
- The camera stream is stopped and its tracks released as soon as scanning stops or the component is disconnected, so the camera indicator does not stay active longer than necessary.
- Downloads (`download()`) generate the PNG/SVG locally via `<canvas>`/`Blob` and trigger a same-origin `<a download>` click; nothing is uploaded or proxied.

See [README.md](README.md#security) for more details on the security model.

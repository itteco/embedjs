# Changelog

## Unreleased

### Changed

- Options form element ids (and the labels' `for`) are prefixed with the form id passed to `buildOptionsForm`, e.g.
  `w1-_hide` instead of `_hide`, so several forms can share a page. Input names are unchanged.
- Query strings (script `src`, `data-iframely-url`): a value keeps everything after the first `=`, a key without a
  value reads as `''` instead of `"undefined"`, and a malformed percent-encoding is kept as written instead of
  aborting the boot.
- `iframely.optionsTranslator` is installed when an i18n bundle registers its labels rather than at import time. On the
  server it is an identity no-op on the stub.
- The ESM core chunk is `dist/esm/chunks/core.js` (was `server-stub.js`; not a public path). The npm build now ships
  source maps and declaration maps.

### Fixed

- `cancelWidget` fires `unload-widget`, so a cancelled widget's intersection observer and timers are released, and no
  longer throws for a widget that is already detached.
- A `postMessage` whose `src` contains quotes or backslashes no longer makes the message listener throw.
- The development server listens on loopback only and refuses dotfiles, so `.env` and `.git` are not served.

## 2.0.0-next.1 (2026-10-20)

First pre-release of 2.0, published under the `next` dist-tag (`npm install @iframely/embed.js@next`); `latest` stays
on 1.x until 2.0.0 ships. Changes since 1.11.0: a rewrite of the toolchain and sources with the same classic script
bundles, plus a real ES module build for npm consumers. See [USAGE.md](USAGE.md) for the recipes and the [README](README.md) for self-hosting and builds.

### Breaking changes

- **The npm package is ESM-only.** `package.json` has `"type": "module"` and an exports map with four entries:
  `@iframely/embed.js`, `@iframely/embed.js/options`, `@iframely/embed.js/i18n/de` and `@iframely/embed.js/i18n/fr`.
  Deep imports of files under `dist/` are not part of the public API. TypeScript declarations are included.
- **The ES module does not auto-run.** Importing `@iframely/embed.js` no longer scans the page on `DOMContentLoaded`.
  Call `iframely.load()` when your markup is in the DOM, or call `iframely.configure({ autorun: true })` right after
  the import to restore the script-tag behavior. The classic script tags (`dist/embed.js` and friends) are unchanged
  and still auto-run.
- **`iframely.extendOptions` is renamed to `iframely.configure`.** The old name remains as a deprecated alias.
- **Legacy browser support is dropped.** ActiveX/Flash detection, `attachEvent`, vendor-prefixed animation frame
  shims and the IE stylesheet fallbacks are gone, and the bundles target Vite's "baseline widely available" set.
- **Options form templates are TypeScript template literals** in `src/options/renderer.ts`; the EJS templates and
  the webpack `ejs-loader` are gone, so custom `.ejs` templates are no longer picked up. Every scalar interpolation is
  now HTML-escaped.
- **Development requires Node 24 and pnpm** (declared via `devEngines`; consumers of the npm package are not
  affected). The build is Vite 8 with TypeScript 7, oxlint and oxfmt; webpack, ejs-loader and ESLint are removed.

### Added

- `iframely.configure(options)` to merge configuration from code. `autorun` can be switched on through it.
- `iframely.unload(container?)`, the inverse of `load()`: removes the widgets the library built from the document or a
  container, releases their intersection observers and pending timers, cancels a pending import request, and fires
  `unload-widget` per widget and a final `unload` event. It does not restore the original `<a data-iframely-url>`
  anchors and does not cover import/shadow DOM widgets.
- Server-side rendering support: importing any entry without a `window` yields an inert stub whose methods are no-ops
  and whose public constants (`VERSION`, `DOMAINS`, `CDN`, `SUPPORTED_THEMES`, ...) and legacy namespaces are readable.
- `iframely.SUPPORT_IFRAME_LOADING_ATTR` is feature-detected from the iframe prototype instead of being derived from a
  Chrome version sniff; browsers without native lazy loading fall back to the server-side `lazy=1` mode.
- A test suite: Vitest unit tests over `src/`, Playwright browser tests against the built bundles with the Iframely API
  stubbed, and `pnpm test:pkg`, which packs the npm tarball and checks every export via `import()` and `require()`, the
  SSR stub and the type declarations under both `bundler` and `nodenext` resolution.
- Demo pages under `demo/`, served by `pnpm serve`, with an optional real API key from a git-ignored `.env`.
- `USAGE.md`, a short recipe guide for the script tag, bundlers, SSR frameworks and the options form.

### Fixed

- Options form: the group template compiled to a lodash `_.escape` call that was not bundled and threw at runtime.
- Options form: option keys containing quotes or brackets no longer break event binding, a radio group with no matching
  value no longer throws on later changes, and the range slider only accepts a number for its `style` value.
- `options.js` loaded without `embed.js` now warns and returns instead of throwing.
- The options subsystem now boots when `embed.js` is loaded before `embed-options.js`, or the base npm entry is
  imported before the options entry.
- Import widgets: every `<script>` in a widget runs (a script following a removed script was skipped), a late import
  response after `unload()` is ignored, and the import cache is cleared between import cycles.
- The `send-intersections` message from an iframe without the library's wrapper structure no longer throws.
- `unload()` removes the host wrapper configured with `parent=`, like `cancelWidget` does.
- Package exports resolve for `require()` on Node 22.12+ and for resolvers using the `default` condition, and the
  shipped declarations resolve under `moduleResolution: node16 / nodenext`.
- The development server rejects encoded-traversal requests that would resolve outside the repository.

### Removed

- The stale `dist/embed-autoplay*` bundles, `lazy-loading-native.js`, the webpack configuration, the EJS templates and
  the ESLint setup.

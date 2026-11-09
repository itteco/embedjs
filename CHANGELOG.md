# Changelog

## Unreleased

### Fixed

- A pre-set `window.iframely = { config: { cdn } }` is no longer replaced by the script's own host when `embed.js` is
  served from the root of a host (`https://static.example.com/embed.js`). A `?cdn=` in the script `src` still wins.
- A document-wide `load()` (the `DOMContentLoaded` autorun included) that arrives while the import request of a
  `load(container)` is pending is replayed when that import ends; it used to be dropped, leaving the links outside the
  container unbuilt. `unload(container)` now cancels a pending import that the container's own `load()` started.
- Links queued for an import from a shadow root, a document fragment or a detached container are released when the
  import fails, does not cover them or is cancelled. They used to keep `data-import-uri`, and every later `load()`
  skipped them.
- `unload(container)` with the `parent` option removes a parent wrapper only inside the container, never the
  container itself or an element above it.
- Two or more `<a data-iframely-url>` links with neither a URL nor an `href` no longer end `load()` in
  "Maximum call stack size exceeded".
- A `postMessage` whose `src` or `context` is not a string no longer makes the message listener throw.

## 2.0.0-next.2 (2026-11-08)

Second pre-release of 2.0, under the `next` dist-tag (`npm install @iframely/embed.js@next`); `latest` stays on 1.x.
2.0.0-next.1 was tagged in this changelog but never published to npm, so this is the first 2.0 release there, and the
changes below come on top of those listed for 2.0.0-next.1.

### Added

- `iframely.LIB_VERSION`: the embed.js release that booted the page, e.g. `'2.0.0'`, injected from `package.json` at
  build time and also readable on the server stub. It is not the API protocol version sent as `v=`, see `API_VERSION`
  below.
- Every bundle in `dist/`, minified ones included, starts with `/*! @iframely/embed.js <version> | MIT | ... */`, so
  a copy (for example in a CMS, or fetched from the cloud) can be identified without running it.
- A console warning when another copy of embed.js initialised `window.iframely` first and its core lacks methods this
  copy provides (typically the 1.x cloud script that API embed codes include, which has no `unload()` or
  `configure()`; or an older release missing a newer method), or reports a different major version. This copy then
  does not start; the warning names both copies, the missing methods and how to load a single copy. Copies that share
  a complete core (`embed.js` with `embed-options.js`, or the cloud script with the npm module) stay silent, as
  before.
- `iframely.load(container)` builds only the embeds inside an element, document fragment or shadow root: links,
  lazy iframes, and a size request to iframes already there; in import mode the container's links are batched into one
  request. It pairs with `unload(container)`. Previously any element other than an `<a>` or `<iframe>` was ignored.
  `load()` without arguments now also asks existing iframes for their size, as USAGE.md already stated.
- USAGE.md "Framework lifecycle": per-container `load(el)` / `unload(el)`, `unload()` on an already detached container,
  and keying the container on the embed HTML. The Svelte recipe is now an attachment, the React one keyed on `html`.
- TypeScript: an `IframelyEvents` map types the callback arguments of `iframely.on` (and `trigger`/`triggerAsync`)
  by event name, custom event names stay untyped; `load()` has overloads for `()`, `(container | anchor)` and
  `(container, url)`.

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
- TypeScript: `configure()` (and `extendOptions()`) take `IframelyConfig` instead of `Record<string, any>`, so known
  keys such as `theme` or `cdn` are checked and other keys must be scalars, as the runtime expects.
- `iframely.VERSION` is renamed to `iframely.API_VERSION`, which says what it is: the API protocol version the library
  sends as `v=` (still `1`), not a release number. `VERSION` remains as a deprecated alias with the same value, but the
  library no longer reads it, so assigning it does not change `v=`.

### Fixed

- USAGE.md §1 configured a script-tag page by calling `iframely.configure()` right after an `async` script tag, which
  throws because the script has not run yet. It now pre-sets `window.iframely = { config: { ... } }` before the
  tag, and an e2e test covers that pattern.
- `iframely.configure({ cdn })` sets the iframe host (`iframely.CDN`). The key was documented but did nothing, so
  iframes from your own CDN were neither resized nor recognised by `unload()`. The value may carry a protocol or a
  trailing slash, and a pre-set `window.iframely = { config: { cdn } }` applies at boot; a script `src` `?cdn=` still
  wins. A `CDN` assigned with a protocol is now also matched when routing iframe messages.
- `cancelWidget` fires `unload-widget`, so a cancelled widget's intersection observer and timers are released, and no
  longer throws for a widget that is already detached.
- A `postMessage` whose `src` contains quotes or backslashes no longer makes the message listener throw.
- The development server listens on loopback only and refuses dotfiles, so `.env` and `.git` are not served.

## 2.0.0-next.1 (2026-10-20)

First pre-release of 2.0, prepared for the `next` dist-tag but never published to npm; its changes first ship in
2.0.0-next.2. `latest` stays on 1.x until 2.0.0 ships. Changes since 1.11.0: a rewrite of the toolchain and sources with the same classic script
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

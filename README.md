# Iframely.com Embed.js

Embed.js script is a part of [Iframely](https://iframely.com) cloud service for rich media embeds and works *only* with
Iframely-hosted [iFrame helpers](https://iframely.com/docs/iframes). The script is normally hosted on Iframely's CDN and
is included, when needed, in the HTML codes our APIs return. To self-host the script or bundle it into your app
instead, get it here on GitHub or from npm.

The script's main function is to adjust the height of rich media with variable sizes (say, Twitter, Facebook, or
Iframely summary cards) and to handle other messages received from Iframely iFrames. The script also enables
lazy-loading through intersection observer (including video placeholders), unfurls URLs if you use Iframely without
making API requests first, and uses web component imports to speed up bulk inserts of rich media. Read more about the
script itself at [iframely.com/docs/embedjs](https://iframely.com/docs/embedjs). This README covers self-hosting,
bundling, and building the script.

For copy-paste recipes (script tag, bundlers, SSR frameworks, the options form) see [USAGE.md](USAGE.md); release
notes are in [CHANGELOG.md](CHANGELOG.md).

## Host embed.js on your servers

Serve one of these files from your own domain:

* `dist/embed.min.js` - minified, for production
* `dist/embed.js` - not minified, for development
* `dist/embed-options.js` and `dist/embed-options.min.js` - embed.js plus the [options form](#optionsjs)

Get them by cloning this repo or from npm:

```bash
npm install @iframely/embed.js
```

This installs 2.x. Coming from 1.x, see [Upgrading from 1.x](CHANGELOG.md#upgrading-from-1x) in the changelog; to
stay on 1.x, install `@iframely/embed.js@1`.

Whichever file you serve, name it `embed.js` (or `iframely.js`), for example with a symlink to `embed.min.js`. The
script reads its [query-string settings](#using-embedjs-without-api-calls) only from a file with one of those names.
Serve it from a folder, not the root of a host: a script at `https://your.host/embed.js` takes `your.host` for your
Iframely CDN.

To bundle embed.js into your own JavaScript instead, import the ES module:
`import { iframely } from '@iframely/embed.js'` (embed only) or `'@iframely/embed.js/options'` (embed + options form,
with label translations in `'@iframely/embed.js/i18n/de'` and `'@iframely/embed.js/i18n/fr'`). TypeScript declarations
are included. Unlike the script tag, the ES module does **not** auto-run on DOMContentLoaded — activate it when your
page is ready:

```js
import { iframely } from '@iframely/embed.js';

iframely.configure({ key: '...' });
iframely.load();
```

To get the script-tag behavior back instead, call `iframely.configure({ key: '...', autorun: true })` right after the
import.

The module is safe to import in isomorphic setups (SvelteKit, Next.js, etc.): on the server it exports an inert
no-op stub and performs no side effects, so you can import it at the top level and call `iframely.load()` from
client-only code (a Svelte attachment or React's `useEffect`; see [USAGE.md §3](USAGE.md#3-server-side-rendering)).

To deactivate, `iframely.unload()` removes the widgets that `load()` built and releases their intersection observers
and pending timers. In a component, scope both calls to its element:

```js
iframely.load(containerEl);      // build the embeds inside one container
iframely.unload(containerEl);    // remove them when the view goes away
```

`unload()` does not restore the original `<a data-iframely-url>` markup (re-render it yourself, for example by keying
the container on the embed HTML), does not cover import/shadow-DOM widgets, and does not remove event listeners: for
those, call the function that `iframely.on()` returns, or `iframely.off()`.

## Omit cloud embed.js from API responses

The HTML embed codes you get from Iframely APIs include the cloud copy of embed.js by default (as
`<script src="https://iframely.net/embed.js">`). If you self-host embed.js, remove that `<script>` tag: make your API calls
with the [&omit_script=1](https://iframely.com/docs/omit-script) query string.

If an older copy loads first (the 1.x cloud script, or a 2.x release missing newer methods), your copy logs a console
warning that starts with `[iframely] embed.js ... found window.iframely already initialised` and does not start.

## Using embed.js without API calls

If you use embed.js to unfurl links without first requesting HTML codes from Iframely APIs, your self-hosted script
must be configured with your key to link to your Iframely account. In browser code, use `key`, the MD5 hash of your
API key, rather than `api_key` itself: everything you configure here is visible in your page source. See
[allowed origins](https://iframely.com/docs/allow-origins) to limit which sites can use it.

If you serve embed.js as a separate script, add the parameters to its `src`:

```html
<script src="https://your.host/js/embed.js?key=..." async></script>
```

You may use any other supported [query-string parameters](https://iframely.com/docs/parameters). The script finds its
own `<script>` tag and reads the parameters from its `src`. This works only when the file is named `embed.js` or
`iframely.js` and `src` is a full URL (`https://...` or `//...`), not a relative path. If your pages already load
another file named `embed.js`, serve ours as `iframely.js`.

You can also pre-set the config before the script loads:

```html
<script>window.iframely = { config: { key: '...' } };</script>
<script src="https://your.host/js/embed.js" async></script>
```

If you bundle embed.js, configure it in code:

```js
iframely.configure({ key: '...' });
```

(`iframely.extendOptions` still works as a deprecated alias of `iframely.configure`.)

## Self-hosting embed.js when you also use custom CDN

You probably don't need to. With your own CDN, `YOUR_CDN/embed.js` already serves the current script straight from
Iframely's origin, so there's nothing to host or update. Self-host only if your security policy requires every script
to come from your own servers.

If your iFrames come from Iframely's default CDN, skip this section.

If you use the ["bring your own CDN"](https://iframely.com/docs/cdn) option and self-host the script, tell the script
your CDN's domain: embed.js finds Iframely iFrames on the page by their `src`.

Add it as a `?cdn=` query-string parameter if you serve the file separately, or set it from code:

```js
iframely.configure({ cdn: 'ABC.cloudfront.net' });
```

Before the script has loaded, pre-set it instead: `window.iframely = { config: { cdn: 'ABC.cloudfront.net' } }`.
Assigning `iframely.CDN` directly keeps working too.

## Options.js

The repository also includes `options.js`, an extension of embed.js that renders the
[URL Options](https://iframely.com/docs/options) form.

Options are URL, provider, or content specific additional query-string parameters that you can give your users as the
HTML form to fine-tune their rich media.

[Read details in our docs](https://iframely.com/docs/options).

The files in `dist/`:

* `dist/options.min.js` - minified, for production; load it next to `embed.js`
* `dist/options.js` - not minified, for development
* `dist/embed-options.js` and `dist/embed-options.min.js` - embed.js and the options form in one file
* `dist/options.i18n.de.js` and `dist/options.i18n.fr.js` (and their `.min.js` versions) - optional label
  translations

To customize the script, you may consider editing the template literals for UI elements
(see [src/options/renderer.ts](src/options/renderer.ts)) and rebuilding, or simply style the default ones with CSS.

To add a language, follow the steps in [labels.LAN.example.ts](src/options/lang/labels.LAN.example.ts). For the npm
module, also add the new file to the ESM `input` in `scripts/build.js` and to `exports` in `package.json`. Pull
requests with your translations are welcome.

## Development

### Build embed.js

The build uses [Vite](https://vite.dev) and TypeScript 7 (the native compiler). Linting is
[oxlint](https://oxc.rs/docs/guide/usage/linter) and formatting is [oxfmt](https://oxc.rs/docs/guide/usage/formatter)
(`pnpm lint` / `pnpm format`), configured in `oxlint.config.ts` and `oxfmt.config.ts`. Sources are ES modules in
`src/`. Requires Node 24 (pinned in `.node-version`; the TypeScript config files rely on Node's native type stripping)
and [pnpm](https://pnpm.io).

Install required modules first:

```bash
pnpm install
```

Do a full build (typecheck, lint and format check, then all bundles — both minified and not — plus the ESM build and
type declarations into `dist/`):

```bash
pnpm build
```

The classic script bundles keep their historical names and stay plain IIFE scripts: `dist/embed.js`,
`dist/embed-options.js`, `dist/options.js`, `dist/options.i18n.*.js` and their `.min.js` versions. The ES module build
for bundler consumers lands in `dist/esm/` with declarations in `dist/types/`.

### Tests

Unit tests run with [Vitest](https://vitest.dev) (jsdom) over the modules in `src/`; browser tests run
with [Playwright](https://playwright.dev) in Chromium, Firefox and WebKit against the built bundles served from
`dist/`, using the pages in `demo/` as fixtures (the Iframely API endpoint is stubbed via request interception, so no
network access or API key is needed).

```bash
pnpm test        # unit tests (Vitest)
pnpm test:e2e    # builds dist/, then browser tests (Playwright)
pnpm test:pkg    # packs the npm tarball; checks every export via import()/require(), the SSR stub and the type declarations
```

First-time setup for browser tests: `pnpm exec playwright install chromium firefox webkit`. To run a single
browser, pass `--project`, e.g. `pnpm test:e2e --project=chromium`.

### Demo pages

The test pages in `demo/` double as a manual playground: run `pnpm serve` and open
[http://localhost:8917](http://localhost:8917). To exercise the real Iframely API there, copy `.env.example` to `.env`
(git-ignored) and set `IFRAMELY_API_KEY` — the dev server substitutes it into the demo pages at request time, so the
key never appears in committed files. Stop the dev server before `pnpm test:e2e`: the tests start their own instance
pinned to the `TEST` placeholder.

## Stay up-to-date

Self-hosted copies don't update themselves. Check npm or follow this repo on GitHub for new versions, and run
`npm update @iframely/embed.js` or `git pull` when one comes out. `npm update` stays within a major version: to move
from 1.x to 2.x, run `npm install @iframely/embed.js@latest` and follow
[Upgrading from 1.x](CHANGELOG.md#upgrading-from-1x). Ping us by creating an issue here or at support at
iframely.com if you need help.

To see which build a page runs, type `iframely.LIB_VERSION` in the browser console. Every file in `dist/` also names
its release on the first line, e.g. `/*! @iframely/embed.js 2.0.0 | MIT | ... */`, so a copy can be identified
without running it. Please include the version when you report an issue.

# Iframely.com Embed.js

Embed.js script is a part of [Iframely](https://iframely.com) cloud service for rich media embeds and works *only* with
Iframely-hosted [iFrame helpers](https://iframely.com/docs/iframes). The script is normally hosted on Iframely's CDN and
is included when required in HTML codes that our API returns. If you wish to self-host the script rather than rely on
our CDN, we make the script available here on GitHub and on NPM.

The script's main function is to adjust the height of rich media with variable sizes (say, Twitter, Facebook, or
Iframely summary cards) and to handle other messages received from Iframely iFrames. The script also enables
lazy-loading through intersection observer (including video placeholders), unfurls URLs if you use Iframely without
making API requests first, and uses web component imports to speed up bulk inserts of rich media. Read more about the
script itself at [iframely.com/docs/embedjs](https://iframely.com/docs/embedjs). The description below focuses solely on
self-hosting of the script.

For copy-paste recipes (script tag, bundlers, SSR frameworks, the options form) see [USAGE.md](USAGE.md); release
notes are in [CHANGELOG.md](CHANGELOG.md).

## Host embed.js on your servers

To serve embed.js script from your network, your reverse proxy needs to be configured to point `embed.js` file to its
location on the local disc.

* `dist/embed.js` - not minified development version
* `dist/embed.min.js` - minified production version

You can either clone repo from GitHub or pull the library from NPM as `@iframely/embed.js`. We recommend creating a
symlink to a file first for a simpler reverse proxy config.

Alternatively, you may include the contents of embed.js in your other JavaScript distributions. The package ships an ES
module build: `import { iframely } from '@iframely/embed.js'` (embed only) or `'@iframely/embed.js/options'` (embed +
options form). TypeScript declarations are included. Unlike the script tag, the ES module does **not** auto-run on
DOMContentLoaded — activate it when your page is ready:

	import { iframely } from '@iframely/embed.js';

	iframely.configure({ api_key: '...' });
	iframely.load();

To get the script-tag behavior back instead, call `iframely.configure({ api_key: '...', autorun: true })` right after
the import.

The module is safe to import in isomorphic setups (SvelteKit, Next.js, etc.): on the server it exports an inert
no-op stub and performs no side effects, so you can import it at the top level and call `iframely.load()` from
client-only code (e.g. Svelte's `onMount`).

To deactivate, `iframely.unload()` (or `iframely.unload(container)`) removes the widgets that `load()` built and
releases their intersection observers and pending timers — pair it with `load()` across route changes or in unmount
hooks. It does not restore the original `<a data-iframely-url>` markup (re-render it yourself to re-embed), and it
does not cover import/shadow-DOM widgets.

## Omit cloud embed.js from API responses

The HTML embed codes you get from Iframely APIs will include the cloud copy of embed.js by default (as
`<script src="//cdn.iframe.ly/embed.js">`). You need to remove that script piece if you're going to self-host embed.js.

To do it, make your API calls with [&omit_script=1](https://iframely.com/docs/omit-script) query-string.

## Using embed.js without API calls

If you use embed.js script to unfurl links without requesting actual HTML codes from Iframely APIs first, it is critical
that your self-hosted script initiates `api_key` (or `key`) to properly link to your Iframely account.

If you serve embed.js as a separate script, you can add query-string parameters to it. Say,

	<script src=".../embed.js?api_key=..." async>

You may use any other supported [query-string parameters](https://iframely.com/docs/parameters). The script will find
itself by name and will initiate params from the query-string. If you happen to already have another file with embed.js
name, you may serve our script as with the name `iframely.js` - in any case we will only grab config from a file with a
query-string.

On the other hand, if you mix embed.js with your other scripts, after you've added embed.js, you can configure options
in the code as:

	iframely.configure({api_key: '...'});

(`iframely.extendOptions` still works as a deprecated alias of `iframely.configure`.)

## Self-hosting embed.js when you also use custom CDN

Please don't :). Consider that the hassle of host and update embed.js youself, provided that the script is already
available and up to date as `YOUR_CDN/embed.js` anyway and sourced directly from Iframely origins. However, if your
security team does require no third-party scripts in any form, read on.

If you use Iframely default CDN for iFrames, no action is required as well.

But if you use ["bring your own CDN"](https://iframely.com/docs/cdn) option and do need to self-host the script, then
you also need to configure CDN's domain name. It is because the embed.js script works with Iframely iFrames on your
page, and it is critical that it can find such iFrames by src.

To configure your own CDN, add it as `?cdn=` query-string param if you source a file separately, or, if you mix it with
other scripts:

	var iframely = window.iframely || {};
	iframely.CDN = 'ABC.cloudfront.net';

## Options.js

Also included in the repository is the `options.js`. It is an extension to the embed.js script that helps
render [URL Options](https://iframely.com/docs/options) form.

Options are URL, provider, or content specific additional query-string parameters that you can give your users as the
HTML form to fine-tune their rich media.

[Read details in our docs](https://iframely.com/docs/options).

After you run the build process, `options.js` will appear in the `dist`:

* `dist/options.js` - not minified development version
* `dist/options.min.js` - minified production version

To customize the script, you may consider editing the template literals for UI elements
(see [src/options/renderer.ts](https://github.com/itteco/embedjs/tree/master/src/options/renderer.ts)) or simply style
the default ones with CSS.

To add more languages with form label translations,
see [labels.LAN.example.ts](https://github.com/itteco/embedjs/tree/master/src/options/lang/labels.LAN.example.ts). Pull
requests with your translations are welcome.

## Working with the distribution

### Build embed.js

The build uses [Vite](https://vite.dev) and TypeScript 7 (the native compiler); linting
is [oxlint](https://oxc.rs/docs/guide/usage/linter) and formatting
is [oxfmt](https://oxc.rs/docs/guide/usage/formatter) (`pnpm lint` / `pnpm format`), both configured via
`oxlint.config.ts` / `oxfmt.config.ts`. Sources are ES modules in `src/`. Requires Node 24 (pinned in `.node-version`;
the TypeScript config files rely on Node's native type stripping) and [pnpm](https://pnpm.io).

Install required modules first:

```bash
pnpm install
```

Do a full build (typecheck + lint, then all bundles — both minified and not — plus the ESM build and type declarations
into `dist/`):

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
The same pages double as a manual playground: `pnpm serve` and open [http://localhost:8917](http://localhost:8917). To
exercise the real Iframely API there, copy `.env.example` to `.env` (git-ignored) and set `IFRAMELY_API_KEY` — the dev
server substitutes it into the demo pages at request time, so the key never appears in committed files. Note: stop the
dev server before `pnpm test:e2e`; the tests start their own instance pinned to the `TEST` placeholder.

```bash
pnpm test        # unit tests (Vitest)
pnpm test:e2e    # builds dist/, then browser tests (Playwright)
pnpm test:pkg    # packs the npm tarball; checks every export via import()/require(), the SSR stub and the type declarations
```

First-time setup for browser tests: `pnpm exec playwright install chromium firefox webkit`. To run a single
browser, pass `--project`, e.g. `pnpm test:e2e --project=chromium`.

### Or pull from NPM

```bash
npm install `@iframely/embed.js`
```

Pre-releases of 2.0 are published under the `next` dist-tag and do not affect `latest`:

```bash
npm install @iframely/embed.js@next
```

## Stay up-to-date

Please monitor any new versions on NPM or follow this repo here on GitHub to see what's happening. From time-to-time, we
may need a fix or new features, and then you need to `npm update @iframely/embedjs` or `git pull`. Ping us by creating
an issue here or at support at iframely.com if you need help.

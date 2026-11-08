# How to use embed.js

embed.js is the client half of [Iframely](https://iframely.com) embeds: it sizes Iframely iframes, handles their
messages, lazy-loads them and can unfurl plain links into embeds. This page is a quick recipe book. The
[README](README.md) covers self-hosting, builds and tests in depth; the full reference is at
[iframely.com/docs/embedjs](https://iframely.com/docs/embedjs).

There are two ways to consume the library:

| Form | File | Auto-runs on page load | Use when |
| --- | --- | --- | --- |
| Classic script | `dist/embed.js` (or `.min.js`) | Yes | Plain HTML pages, CMS themes, Iframely API HTML |
| ES module | `@iframely/embed.js` from npm | No, call `iframely.load()` | Bundlers, SPAs, SSR frameworks |

## 1. Classic script tag

Pass configuration as query-string parameters. The script finds itself by name and reads them.

```html
<script src="https://your.host/embed.js?api_key=YOUR_KEY&theme=auto" async></script>
```

Or set the config from code before the script tag. The script picks it up when it starts, whether it loads
`async`, deferred or from cache; query-string parameters in its `src` are merged on top:

```html
<script>
    window.iframely = { config: { api_key: 'YOUR_KEY', theme: 'auto' } };
</script>
<script src="https://your.host/embed.js" async></script>
```

`iframely.configure()` exists only once the script has run, so call it from code that runs later, not right after
an `async` script tag. Avoid `onload="iframely.configure(...)"` too: the script may already have built the embeds by
then.

Commonly used keys: `api_key` (or `key`), `theme` (`auto`, `light`, `dark`), `cdn` (the host your iframes are served
from, e.g. `'iframes.example.com'`, when you use your own CDN; it sets `iframely.CDN`), `lazy`, `maxwidth`, `align`,
`nonce`. The full list is at
[iframely.com/docs/parameters](https://iframely.com/docs/parameters).

### Markup the script works with

**HTML codes from the Iframely API.** They already include the cloud copy of embed.js. If you self-host the script,
request codes with [`&omit_script=1`](https://iframely.com/docs/omit-script) and include your own copy once per page.

**Plain links, no API call.** Put the URL in an anchor and let the script unfurl it. An `api_key` is required.

```html
<div class="iframely-embed"><div class="iframely-responsive">
    <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" data-iframely-url></a>
</div></div>
```

Links added after page load are picked up by calling `iframely.load()` again, or `iframely.load(anchor)` for a single
link. `iframely.load(container, url)` appends a new link to a container and unfurls it in one step.

## 2. ES module in a browser app

```js
import { iframely } from '@iframely/embed.js';

iframely.configure({ api_key: 'YOUR_KEY' });
iframely.load();                 // scan the DOM and build embeds
```

The module never runs on its own: call `load()` when your markup is in the DOM and again after you insert new
embeds. Pair it with `unload()` when a view goes away. In a component, scope both to the component's element:

```js
iframely.load();                 // whole document
iframely.load(containerEl);      // only the embeds inside one container
iframely.unload();               // whole document
iframely.unload(containerEl);    // one container only
```

`unload()` removes the widgets that `load()` built and releases their observers and timers. It does not restore the
original `<a data-iframely-url>` anchors, so re-render your markup before calling `load()` again.

To get the script-tag behavior (auto-run on `DOMContentLoaded`) from the module, turn `autorun` on right after the
import:

```js
import { iframely } from '@iframely/embed.js';

iframely.configure({ api_key: 'YOUR_KEY', autorun: true });
```

The module and the `embed.js` script tag share one `window.iframely`, config included. If a page also loads the
script tag (a CMS or a third-party widget may add it), importing the module before `DOMContentLoaded` switches
autorun off for the script tag too, and its embeds wait for your `load()` call. Either call `load()` as usual or
turn `autorun` back on as above. A config that pre-sets `autorun` (`window.iframely = { config: { autorun: true } }`)
is left as is.

Sharing works within one major version only. If a pre-2.0 `embed.js` (such as the cloud copy that API embed codes
include) initialises `window.iframely` first, the module does not start: `unload()`, `configure()` and the other 2.0
methods are missing, and the console shows an `[iframely]` warning naming both copies. Load a single copy: request API
codes with `omit_script=1` or remove the other script tag.

## 3. Server-side rendering

Importing the package on the server is safe: it exports an inert stub, has no side effects and shares no state
between requests. Keep `load()` and `unload()` in client-only lifecycle hooks.

Svelte / SvelteKit (an attachment, Svelte 5.29+; with older versions use an action with the same body):

```svelte
<script>
    import { iframely } from '@iframely/embed.js';

    let { html } = $props();
    iframely.configure({ api_key: 'YOUR_KEY' });

    function embeds(node) {
        iframely.load(node);
        return () => iframely.unload(node);
    }
</script>

{#key html}
    <div {@attach embeds}>{@html html}</div>
{/key}
```

React / Next.js:

```jsx
import { useEffect, useRef } from 'react';
import { iframely } from '@iframely/embed.js';

iframely.configure({ api_key: 'YOUR_KEY' });

function Embed({ html }) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        iframely.load(el);
        return () => iframely.unload(el);
    }, []);
    return <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Embeds({ html }) {
    return <Embed key={html} html={html} />;
}
```

### Framework lifecycle

- Pair `load(el)` and `unload(el)` per container, as above, so a component builds and removes only its own embeds.
- Call `unload(el)` in cleanup even when the framework has already detached `el` (Svelte teardown, React cleanup
  after unmount). That is supported: the widgets inside are still found, and their observers and timers released.
- Key the container on the embed HTML (`{#key html}`, `key={html}`). `load()` consumes the
  `<a data-iframely-url>` anchors and `unload()` does not put them back, so each new API response needs fresh markup;
  without a key, the next `load()` finds nothing to build.

Typical flow: call the Iframely API on the server with `omit_script=1`, render the returned HTML, then let the
client-side `load()` size the iframes and wire up events. On the server the methods are no-ops and the public
constants such as `iframely.DOMAINS` or `iframely.LIB_VERSION` are readable, so shared code can import the module at
the top level.

`iframely.LIB_VERSION` is the embed.js release, e.g. `'2.0.0'`; check it when a page may load more than one copy.
`iframely.VERSION` is not a release number: it is the API protocol version the library sends as `v=`, and stays `1`.

## 4. Options form (URL options)

[URL options](https://iframely.com/docs/options) are per-URL query parameters users can tweak through an HTML form.
The form builder ships in two script flavors:

* `dist/embed-options.js`: embed.js plus the form builder in one file.
* `dist/options.js`: form builder only, to load next to an existing `embed.js`.
* `dist/options.i18n.de.js`, `dist/options.i18n.fr.js`: optional label translations.

```html
<script src="https://your.host/embed-options.js?api_key=YOUR_KEY"></script>
<script src="https://your.host/options.i18n.de.js"></script>

<div id="options-form"></div>
<script>
    // `options` is the "options" object from the Iframely API response for this URL.
    var options = {
        theme:   { label: 'Theme color',   value: 'light', values: { light: 'Light', dark: 'Dark', auto: 'Auto' } },
        _hide:   { label: 'Hide artwork',  value: false },
        _height: { label: 'Adjust height', value: 200, range: { min: 100, max: 600 } }
    };

    iframely.on('options-changed', function (id, container, query) {
        // `query` holds the changed parameters; re-request the embed with them.
    });

    iframely.buildOptionsForm(
        'my-form',                              // any id, echoed back in the event
        document.getElementById('options-form'),
        options,
        iframely.optionsTranslator('de')        // optional
    );
</script>
```

From a bundler, import the options entry. It includes everything the base entry does, and importing both in one app
is fine: they share a single `iframely` object.

```js
import { iframely } from '@iframely/embed.js/options';
import '@iframely/embed.js/i18n/de';   // optional translations

iframely.buildOptionsForm('my-form', formEl, options, iframely.optionsTranslator('de'));
```

Style the generated form with CSS (`.iframely-option`, `.iframely-option__label`, `.iframely-option__input`, ...)
or edit the template literals in `src/options/renderer.ts` and rebuild.

## 5. Runtime API at a glance

| Call | What it does |
| --- | --- |
| `iframely.configure(opts)` | Merge config keys (`api_key`, `theme`, ...). A key disabled with `false` stays off; `autorun` is the exception. `cdn` sets the iframe host (`iframely.CDN`) instead. |
| `iframely.load()` | Scan the whole document: unfurl links, start lazy iframes, size existing ones. |
| `iframely.load(container)` | The same, inside one element (or shadow root) only. In import mode, the container's links are batched into one request. |
| `iframely.load(anchor)` / `iframely.load(container, url)` | Unfurl one link, or append a new link to a container and unfurl it. |
| `iframely.unload(container?)` | Remove built widgets and release their observers and timers. |
| `iframely.setTheme(theme, container?)` | Switch live iframes to `auto`, `light` or `dark`. |
| `iframely.on(event, cb)` | Subscribe to library events. |
| `iframely.buildOptionsForm(id, el, options, translator?)` | Render a URL options form (options bundle only). |
| `iframely.optionsTranslator(lang)` | Translator for `buildOptionsForm` from a loaded i18n bundle. |

Useful events for `iframely.on`:

| Event | Arguments | Fired when |
| --- | --- | --- |
| `iframe-ready` | `iframe` | An embed iframe has been created or revealed. |
| `options-changed` | `id, container, query` | The user changed a value in an options form. |
| `set-theme` | `theme` | `setTheme()` applied a theme. |
| `heightChanged` | `iframe, oldHeight, newHeight` | An embed changed its height. |
| `cancel` | `url, parentNode, text, nextSibling` | No embed for the URL; the widget was removed. |
| `unload` | `container?` | `unload()` finished. |

With TypeScript, `iframely.on` infers the callback arguments from the event name (the `IframelyEvents` type lists
them), `load()` has one overload per form above, and `configure()` checks the known keys. Other event names are
custom events with untyped arguments, so a misspelled event name still compiles.

`iframely.extendOptions` is a deprecated alias of `configure`; `iframely.widgets.load` and `iframely.events.on`
remain as pre-2.0 shims.

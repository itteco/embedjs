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

Or configure from code once the script is on the page:

```html
<script src="https://your.host/embed.js" async></script>
<script>
    window.iframely = window.iframely || {};
    iframely.configure({ api_key: 'YOUR_KEY', theme: 'auto' });
</script>
```

Commonly used keys: `api_key` (or `key`), `theme` (`auto`, `light`, `dark`), `cdn` (your own iframe CDN host),
`lazy`, `maxwidth`, `align`, `nonce`. The full list is at
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
embeds. Pair it with `unload()` when a view goes away:

```js
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

## 3. Server-side rendering

Importing the package on the server is safe: it exports an inert stub, has no side effects and shares no state
between requests. Keep `load()` and `unload()` in client-only lifecycle hooks.

Svelte / SvelteKit:

```svelte
<script>
    import { onMount, onDestroy } from 'svelte';
    import { iframely } from '@iframely/embed.js';

    onMount(() => {
        iframely.configure({ api_key: 'YOUR_KEY' });
        iframely.load();
    });
    onDestroy(() => iframely.unload());
</script>
```

React / Next.js:

```jsx
import { useEffect } from 'react';
import { iframely } from '@iframely/embed.js';

export function Embeds({ html }) {
    useEffect(() => {
        iframely.configure({ api_key: 'YOUR_KEY' });
        iframely.load();
        return () => iframely.unload();
    }, [html]);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

Typical flow: call the Iframely API on the server with `omit_script=1`, render the returned HTML, then let the
client-side `load()` size the iframes and wire up events. On the server the methods are no-ops and the public
constants such as `iframely.DOMAINS` or `iframely.VERSION` are readable, so shared code can import the module at the
top level.

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
| `iframely.configure(opts)` | Merge config keys (`api_key`, `theme`, `cdn`, ...). A key disabled with `false` stays off; `autorun` is the exception. |
| `iframely.load()` | Scan the whole document: unfurl links, start lazy iframes, size existing ones. |
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
| `unload` | `container?` | `unload()` finished. |

`iframely.extendOptions` is a deprecated alias of `configure`; `iframely.widgets.load` and `iframely.events.on`
remain as pre-2.0 shims.

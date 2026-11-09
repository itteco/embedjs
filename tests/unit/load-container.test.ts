import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import iframely from '../../src/iframely';
import { boot as bootConst } from '../../src/const';
import { boot as bootEvents } from '../../src/events';
import { boot as bootUtils } from '../../src/utils';
import { boot as bootImport } from '../../src/import';
import { boot as bootAhref } from '../../src/ahref';
import { boot as bootLazyIframe } from '../../src/lazy-iframe';

// load(container) builds what is inside the container and nothing else:
// the component-scoped counterpart of unload(container).
beforeAll(() => {
	bootConst();
	bootEvents();
	bootUtils();
	bootImport();
	bootAhref();
	bootLazyIframe();
});

beforeEach(() => {
	// intersection.ts switches `intersection` on at 'init'.
	iframely.config = { api_key: 'k', intersection: 1 };
	iframely.SUPPORT_IFRAME_LOADING_ATTR = true;
	document.body.innerHTML = '';
	// Drops a pending import of the previous test.
	iframely.unload();
});

function wrap(inner: string): string {
	return '<div class="iframely-embed"><div class="iframely-responsive">' + inner + '</div></div>';
}

const anchor = (url: string) => wrap('<a href="' + url + '" data-iframely-url></a>');
const lazyIframe = (id: string) =>
	wrap(
		'<iframe data-iframely-url="//cdn.iframe.ly/' +
			id +
			'?url=https%3A%2F%2Fx.example"></iframe>'
	);
const directIframe = (id: string) =>
	wrap('<iframe src="https://cdn.iframe.ly/' + id + '"></iframe>');

describe('load(container)', () => {
	it('builds the anchors and lazy iframes inside the container only', () => {
		document.body.innerHTML =
			'<div id="in">' +
			anchor('https://in.example/1') +
			lazyIframe('lazyin') +
			'</div>' +
			'<div id="out">' +
			anchor('https://out.example/1') +
			lazyIframe('lazyout') +
			'</div>';
		const inside = document.getElementById('in')!;
		const outside = document.getElementById('out')!;

		iframely.load(inside);

		expect(inside.querySelector('a[data-iframely-url]')).toBeNull();
		expect(inside.querySelector('iframe[src*="in.example"]')).not.toBeNull();
		expect(inside.querySelector('iframe[src*="lazyin"]')).not.toBeNull();
		expect(outside.querySelector('a[data-iframely-url]')).not.toBeNull();
		expect(outside.querySelector('iframe[src]')).toBeNull();
	});

	it('asks the iframes already in the container, and only those, for their size', () => {
		document.body.innerHTML =
			'<div id="in">' +
			directIframe('abc') +
			'</div><div id="out">' +
			directIframe('def') +
			'</div>';
		const [inIframe, outIframe] = Array.from(document.querySelectorAll('iframe'));
		const inPost = vi.spyOn(inIframe.contentWindow!, 'postMessage');
		const outPost = vi.spyOn(outIframe.contentWindow!, 'postMessage');

		iframely.load(document.getElementById('in')!);

		expect(inPost).toHaveBeenCalledTimes(1);
		expect(JSON.parse(inPost.mock.calls[0][0] as string).method).toBe('getSize');
		expect(outPost).not.toHaveBeenCalled();
	});

	it('also sizes existing iframes on a document-wide load()', () => {
		document.body.innerHTML = directIframe('abc');
		const post = vi.spyOn(document.querySelector('iframe')!.contentWindow!, 'postMessage');

		iframely.load();

		expect(post).toHaveBeenCalledTimes(1);
	});

	it('leaves nothing behind when paired with unload(container)', () => {
		document.body.innerHTML =
			'<div id="in">' + anchor('https://in.example/1') + lazyIframe('lazyin') + '</div>';
		const inside = document.getElementById('in')!;

		iframely.load(inside);
		expect(inside.querySelectorAll('iframe')).toHaveLength(2);
		iframely.unload(inside);

		expect(inside.querySelectorAll('.iframely-embed')).toHaveLength(0);
	});

	it('scans a shadow root', () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		const shadow = host.attachShadow({ mode: 'open' });
		shadow.innerHTML = anchor('https://in.example/1');

		iframely.load(shadow as unknown as Element);

		expect(shadow.querySelector('iframe[src*="in.example"]')).not.toBeNull();
	});

	it('keeps load(container, url) appending and unfurling one link', () => {
		document.body.innerHTML = '<div id="in"></div>' + anchor('https://out.example/1');
		const inside = document.getElementById('in')!;

		iframely.load(inside, 'https://in.example/1');

		expect(inside.querySelector('iframe[src*="in.example"]')).not.toBeNull();
		expect(document.querySelector('a[href="https://out.example/1"]')).not.toBeNull();
	});

	it('batches the container anchors, and only those, into one import', () => {
		document.body.innerHTML =
			'<div id="in">' +
			anchor('https://in.example/1') +
			anchor('https://in.example/2') +
			'</div>' +
			anchor('https://out.example/1');
		// Keep the JSONP <script> out of the document so jsdom never fetches it.
		const append = vi.spyOn(document.head, 'appendChild').mockImplementation((node) => node);

		iframely.load(document.getElementById('in')!);
		append.mockRestore();

		const src = decodeURIComponent((iframely.import as HTMLScriptElement).src);
		expect(src).toContain('/api/import/v2');
		expect(src).toContain('in.example/1');
		expect(src).toContain('in.example/2');
		expect(src).not.toContain('out.example');
		// The outside anchor is neither queued nor unfurled.
		const out = document.querySelector('a[href="https://out.example/1"]')!;
		expect(out.hasAttribute('data-import-uri')).toBe(false);
		expect(out.hasAttribute('data-iframely-url')).toBe(true);
	});

	// Starts the import of a container holding two anchors; the JSONP <script>
	// stays out of the document so jsdom never fetches it.
	function startContainerImport(container: ParentNode): HTMLScriptElement {
		const append = vi.spyOn(document.head, 'appendChild').mockImplementation((node) => node);
		iframely.load(container as Element);
		append.mockRestore();
		return iframely.import;
	}

	// A document query cannot reach these anchors, so they are released from
	// the import's own record of them.
	it('releases anchors queued from a shadow root when the import fails', () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		const shadow = host.attachShadow({ mode: 'open' });
		shadow.innerHTML = anchor('https://in.example/1') + anchor('https://in.example/2');
		const script = startContainerImport(shadow);
		expect(shadow.querySelectorAll('a[data-import-uri]')).toHaveLength(2);

		script.onerror!(new Event('error'));

		expect(shadow.querySelectorAll('a[data-import-uri]')).toHaveLength(0);
		// The regular loader built them instead.
		expect(shadow.querySelectorAll('iframe[src*="in.example"]')).toHaveLength(2);
	});

	it('releases anchors queued from a detached container on a full unload', () => {
		const container = document.createElement('div');
		container.innerHTML = anchor('https://in.example/1') + anchor('https://in.example/2');
		startContainerImport(container);
		expect(container.querySelectorAll('a[data-import-uri]')).toHaveLength(2);

		iframely.unload();

		expect(container.querySelectorAll('a[data-import-uri]')).toHaveLength(0);
		// A later load(container) can build them.
		iframely.config.import = false;
		iframely.load(container);
		expect(container.querySelectorAll('iframe[src*="in.example"]')).toHaveLength(2);
	});

	// Anchors with neither a url in data-iframely-url nor an href (e.g. the
	// href stripped by a sanitizer) can be neither imported nor unfurled.
	it('does not recurse over anchors that cannot be built', () => {
		const dead = '<a data-iframely-url></a>';
		document.body.innerHTML = '<div id="in">' + wrap(dead) + wrap(dead) + '</div>' + wrap(dead);
		const inside = document.getElementById('in')!;

		expect(() => iframely.load(inside)).not.toThrow();
		expect(() => iframely.load()).not.toThrow();

		expect(iframely.import).toBeUndefined();
		expect(document.querySelector('iframe')).toBeNull();
	});

	it('still builds what it can next to anchors that cannot be built', () => {
		const dead = '<a data-iframely-url></a>';
		document.body.innerHTML =
			'<div id="in">' + wrap(dead) + wrap(dead) + lazyIframe('lazyin') + '</div>';
		const inside = document.getElementById('in')!;

		iframely.load(inside);

		// The lazy-iframe loader runs after the import loader.
		expect(inside.querySelector('iframe[src*="lazyin"]')).not.toBeNull();
	});

	it('still unfurls container anchors while another import is pending', () => {
		document.body.innerHTML =
			'<div id="first">' +
			anchor('https://first.example/1') +
			anchor('https://first.example/2') +
			'</div><div id="second">' +
			anchor('https://second.example/1') +
			'</div>';
		const append = vi.spyOn(document.head, 'appendChild').mockImplementation((node) => node);
		iframely.load(document.getElementById('first')!);
		append.mockRestore();
		expect(iframely.import).toBeTruthy();

		const second = document.getElementById('second')!;
		iframely.load(second);

		expect(second.querySelector('iframe[src*="second.example"]')).not.toBeNull();
	});
});

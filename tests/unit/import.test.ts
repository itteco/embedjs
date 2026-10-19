import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import iframely from '../../src/iframely';
import { boot as bootConst } from '../../src/const';
import { boot as bootEvents } from '../../src/events';
import { boot as bootUtils } from '../../src/utils';
import { boot as bootImport } from '../../src/import';

beforeAll(() => {
	bootConst();
	bootEvents();
	bootUtils();
	bootImport();
});

beforeEach(() => {
	iframely.config = { api_key: 'k' };
	document.body.innerHTML = '';
	document.documentElement.removeAttribute('data-ran');
	// Drops the pending import and the widget cache of the previous test.
	iframely.unload();
});

function anchorHtml(url: string): string {
	return (
		'<div class="iframely-embed"><div class="iframely-responsive">' +
		'<a href="' +
		url +
		'" data-iframely-url></a>' +
		'</div></div>'
	);
}

// Widget scripts record their run in the DOM: jsdom executes them against
// its own window object, which is not the test's `window`.
function recordingScript(name: string): string {
	return (
		'<script>document.documentElement.setAttribute("data-ran", ' +
		'(document.documentElement.getAttribute("data-ran") || "") + "' +
		name +
		',")</script>'
	);
}

function ran(): string[] {
	return (document.documentElement.getAttribute('data-ran') || '').split(',').filter(Boolean);
}

// Starts an import for the given urls. The JSONP <script> is kept out of the
// document so jsdom never fetches it, while import.ts still records it as the
// pending import.
function startImport(urls: string[]): HTMLScriptElement {
	document.body.innerHTML = urls.map(anchorHtml).join('');
	const append = vi.spyOn(document.head, 'appendChild').mockImplementation((node) => node);
	iframely.trigger('load');
	append.mockRestore();
	return iframely.import;
}

describe('import widgets', () => {
	it('queues anchors into one import request', () => {
		const script = startImport(['https://a.example/1', 'https://b.example/2']);
		expect(script).toBeInstanceOf(HTMLScriptElement);
		expect(script.src).toContain('/api/import/v2');
		expect(document.querySelectorAll('a[data-import-uri]')).toHaveLength(2);
	});

	it('executes every script of an imported widget, including one following a removed script', () => {
		startImport(['https://a.example/1', 'https://b.example/2']);

		iframely.buildImportWidgets({
			widgets: [
				{
					uri: 'https://a.example/1',
					html:
						'<blockquote>q</blockquote>' +
						recordingScript('first') +
						recordingScript('second')
				}
			]
		});

		expect(ran()).toEqual(['first', 'second']);
		// Both scripts were re-created (innerHTML-inserted scripts never run).
		const scripts = document.querySelectorAll('.iframely-embed script');
		expect(scripts).toHaveLength(2);
		scripts.forEach((script) => {
			expect(script.getAttribute('type')).toBe('text/javascript');
		});
	});
});

describe('import widgets: unload', () => {
	it('cancels a pending import on unload and ignores its late response', () => {
		const script = startImport(['https://a.example/1', 'https://b.example/2']);
		const remove = vi.spyOn(script, 'remove');
		const loads: Element[] = [];
		iframely.on('load', (el?: Element) => {
			if (el) {
				loads.push(el);
			}
		});
		const imported = vi.fn();
		iframely.on('import-loaded', imported);

		iframely.unload();

		expect(iframely.import).toBeUndefined();
		expect(remove).toHaveBeenCalled();
		expect(script.onerror).toBeNull();
		// Queued anchors are released for the next load().
		expect(document.querySelectorAll('a[data-import-uri]')).toHaveLength(0);

		// A <script> removed from the document may still execute.
		iframely.buildImportWidgets({
			widgets: [{ uri: 'https://a.example/1', html: '<p>late</p>' }]
		});
		expect(imported).not.toHaveBeenCalled();
		expect(loads).toHaveLength(0);
		expect(document.querySelectorAll('.iframely-embed p')).toHaveLength(0);
	});
});

describe('import widgets: request shaping', () => {
	it('skips the import entirely when config.import is false', () => {
		iframely.config = { api_key: 'k', import: false };
		const script = startImport(['https://a.example/1', 'https://b.example/2']);
		expect(script).toBeUndefined();
		expect(document.querySelectorAll('a[data-import-uri]')).toHaveLength(0);
	});

	it('does not start an import for a single anchor', () => {
		expect(startImport(['https://a.example/1'])).toBeUndefined();
	});

	it('sends urls as uri params with the api key and version', () => {
		const script = startImport(['https://a.example/1', 'https://b.example/2']);
		const src = decodeURIComponent(script.src);
		expect(src).toContain('uri=https://a.example/1');
		expect(src).toContain('uri=https://b.example/2');
		expect(src).toContain('api_key=k');
		expect(src).toContain('v=1');
	});

	it('sends CDN ids as the ids param', () => {
		document.body.innerHTML =
			'<div class="iframely-embed"><div class="iframely-responsive">' +
			'<a href="https://x.example/1" data-iframely-url="//cdn.iframe.ly/abc123"></a></div></div>' +
			'<div class="iframely-embed"><div class="iframely-responsive">' +
			'<a href="https://x.example/2" data-iframely-url="//cdn.iframe.ly/def456"></a></div></div>';
		const append = vi.spyOn(document.head, 'appendChild').mockImplementation((node) => node);
		iframely.trigger('load');
		append.mockRestore();

		const src = decodeURIComponent(iframely.import.src);
		expect(src).toContain('/api/import/v2');
		expect(src).toContain('ids=abc123&def456');
		expect(src).not.toContain('uri=');
		expect(document.querySelector('a[data-import-uri="abc123"]')).not.toBeNull();
	});

	it('releases the anchors to the regular loader when the request fails', () => {
		const script = startImport(['https://a.example/1', 'https://b.example/2']);
		const loads: Element[] = [];
		iframely.on('load', (el?: Element) => {
			if (el) {
				loads.push(el);
			}
		});

		script.onerror!(new Event('error'));

		expect(iframely.import).toBeUndefined();
		expect(document.querySelectorAll('a[data-import-uri]')).toHaveLength(0);
		expect(loads.map((el) => el.nodeName)).toEqual(['A', 'A']);
	});
});

describe('import widgets: rendering', () => {
	beforeAll(async () => {
		const { boot } = await import('../../src/widget-cancel');
		boot();
	});

	it('renders a shadow DOM widget and announces it', () => {
		startImport(['https://a.example/1', 'https://b.example/2']);
		const before = vi.fn();
		const after = vi.fn();
		iframely.on('import-shadow-widget-before-render', before);
		iframely.on('import-shadow-widget-after-render', after);

		iframely.buildImportWidgets({
			commonShadowStyles: {},
			widgets: [
				{
					uri: 'https://a.example/1',
					html: '<p>shadow</p>',
					shadow: true,
					context: 'ctx',
					stylesIds: []
				}
			]
		});

		const host = document.querySelector('.iframely-embed > div')!;
		expect(host.shadowRoot).not.toBeNull();
		expect(host.shadowRoot!.querySelector('p')!.textContent).toBe('shadow');
		expect(before).toHaveBeenCalledTimes(1);
		expect(after).toHaveBeenCalledTimes(1);
		expect(after.mock.calls[0][0].shadowRoot).toBe(host.shadowRoot);
		// Anchors the response did not cover go back to the regular loader.
		expect(document.querySelectorAll('a[data-import-uri]')).toHaveLength(0);
	});

	it('cancels a widget the import marks as cancelled', () => {
		startImport(['https://a.example/1', 'https://b.example/2']);

		iframely.buildImportWidgets({ widgets: [{ uri: 'https://a.example/1', cancel: true }] });

		expect(document.querySelectorAll('.iframely-embed')).toHaveLength(1);
		expect(document.querySelector('.iframely-embed a')!.getAttribute('href')).toBe(
			'https://b.example/2'
		);
	});
});

describe('import widgets: cache lifetime', () => {
	it('forgets the anchors of a finished import cycle', () => {
		const failed = startImport(['https://a.example/1', 'https://b.example/2']);
		failed.onerror!(new Event('error'));

		// Same urls in fresh markup: only the new anchor may render.
		startImport(['https://a.example/1', 'https://b.example/2']);
		const rendered = vi.fn();
		iframely.on('import-shadow-widget-after-render', rendered);
		iframely.buildImportWidgets({
			commonShadowStyles: {},
			widgets: [{ uri: 'https://a.example/1', html: '<p>x</p>', shadow: true, stylesIds: [] }]
		});

		expect(rendered).toHaveBeenCalledTimes(1);
	});
});

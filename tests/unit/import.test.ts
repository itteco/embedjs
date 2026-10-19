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
	delete iframely.import;
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

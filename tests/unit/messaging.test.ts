import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import iframely from '../../src/iframely';
import { boot as bootConst } from '../../src/const';
import { boot as bootEvents } from '../../src/events';
import { boot as bootUtils } from '../../src/utils';
import { boot as bootMessaging } from '../../src/messaging';
import * as messaging from '../../src/messaging';

beforeAll(() => {
	bootConst();
	bootEvents();
	bootUtils();
	bootMessaging();
});

beforeEach(() => {
	iframely.config = {};
	document.body.innerHTML = '';
});

function buildWidgetIframe(
	src = 'https://cdn.iframe.ly/api/iframe?url=https%3A%2F%2Fx.com'
): HTMLIFrameElement {
	document.body.innerHTML =
		'<div class="iframely-embed"><div class="iframely-responsive">' +
		'<iframe src="' +
		src +
		'"></iframe>' +
		'</div></div>';
	return document.querySelector('iframe')!;
}

describe('postMessage', () => {
	it('stringifies the message, adds the page context and trims the target origin', () => {
		const iframe = buildWidgetIframe();
		const target = iframe.contentWindow!;
		const spy = vi.spyOn(target, 'postMessage');

		messaging.postMessage(
			{ method: 'getSize' },
			'https://cdn.iframe.ly/some/deep/path?x=1',
			target
		);

		expect(spy).toHaveBeenCalledTimes(1);
		const [data, origin] = spy.mock.calls[0];
		expect(JSON.parse(data as string)).toEqual({
			method: 'getSize',
			context: document.location.href
		});
		expect(origin).toBe('https://cdn.iframe.ly');
	});

	it('defaults the target origin to *', () => {
		const iframe = buildWidgetIframe();
		const target = iframe.contentWindow!;
		const spy = vi.spyOn(target, 'postMessage');

		messaging.postMessage({ method: 'getSize' }, undefined, target);
		expect(spy.mock.calls[0][1]).toBe('*');
	});
});

describe('findIframe', () => {
	it('finds an iframe by contentWindow among domain-matched iframes', () => {
		const iframe = buildWidgetIframe();
		const found = iframely.findIframe({
			contentWindow: iframe.contentWindow,
			domains: iframely.DOMAINS
		});
		expect(found).toBe(iframe);
	});

	it('finds an iframe by src match', () => {
		const iframe = buildWidgetIframe();
		const found = iframely.findIframe({
			contentWindow: iframe.contentWindow,
			src: 'https://cdn.iframe.ly/api/iframe',
			domains: false
		});
		expect(found).toBe(iframe);
	});

	it('tolerates quotes and backslashes in a messaged src', () => {
		const iframe = buildWidgetIframe();
		const find = () =>
			iframely.findIframe({
				contentWindow: iframe.contentWindow,
				src: 'https://evil.example/"]\\',
				domains: false
			});
		expect(find).not.toThrow();
		// No src match, so the domains fallback finds it by contentWindow.
		expect(find()).toBe(iframe);
	});

	it('returns undefined for an unknown contentWindow', () => {
		buildWidgetIframe();
		expect(
			iframely.findIframe({ contentWindow: window, domains: iframely.DOMAINS })
		).toBeUndefined();
	});

	it('finds iframes inside shadow roots', () => {
		document.body.innerHTML = '<div class="iframely-shadow"></div>';
		const host = document.querySelector('.iframely-shadow')!;
		const shadowRoot = host.attachShadow({ mode: 'open' });
		shadowRoot.innerHTML = '<iframe src="https://cdn.iframe.ly/xyz"></iframe>';
		const iframe = shadowRoot.querySelector('iframe')!;

		const found = iframely.findIframe({
			contentWindow: iframe.contentWindow,
			domains: iframely.DOMAINS
		});
		expect(found).toBe(iframe);
	});
});

describe('message listener', () => {
	function dispatchMessage(data: unknown, source: MessageEventSource | null): void {
		window.dispatchEvent(new MessageEvent('message', { data, source }));
	}

	it('resolves the widget and triggers the iframely message event for JSON messages', () => {
		const iframe = buildWidgetIframe();
		const seen: any[] = [];
		iframely.on('message', (widget: any, message: any) => seen.push({ widget, message }));

		dispatchMessage(
			JSON.stringify({ method: 'test-method', domains: 'all' }),
			iframe.contentWindow
		);

		expect(seen).toHaveLength(1);
		expect(seen[0].message.method).toBe('test-method');
		expect(seen[0].widget.iframe).toBe(iframe);
		expect(seen[0].widget.url).toBe('https://x.com');
	});

	it('supports the pym height fallback format', () => {
		const iframe = buildWidgetIframe();
		const seen: any[] = [];
		iframely.on('message', (widget: any, message: any) => seen.push(message));

		dispatchMessage('heightxPYMx120', iframe.contentWindow);

		expect(seen).toHaveLength(1);
		expect(seen[0]).toEqual({ method: 'resize', height: 121, domains: 'all' });
	});

	it('ignores unrelated messages', () => {
		buildWidgetIframe();
		const cb = vi.fn();
		iframely.on('message', cb);

		dispatchMessage('unparseable garbage', null);
		dispatchMessage(JSON.stringify({ noMethod: true }), null);

		expect(cb).not.toHaveBeenCalled();
	});
});

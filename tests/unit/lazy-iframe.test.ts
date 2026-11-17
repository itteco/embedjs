import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import iframely from '../../src/iframely';
import { boot as bootConst } from '../../src/const';
import { boot as bootEvents } from '../../src/events';
import { boot as bootUtils } from '../../src/utils';
import { boot as bootLazyIframe } from '../../src/lazy-iframe';

beforeAll(() => {
	bootConst();
	bootEvents();
	bootUtils();
	bootLazyIframe();
});

beforeEach(() => {
	// intersection.ts switches this on at 'init'.
	iframely.config = { intersection: 1 };
	document.body.innerHTML =
		'<div class="iframely-embed"><div class="iframely-responsive">' +
		'<iframe data-iframely-url="//cdn.iframe.ly/abc123?url=https%3A%2F%2Fx.example"></iframe>' +
		'</div></div>';
});

function iframe(): HTMLIFrameElement {
	return document.querySelector('iframe')!;
}

describe('lazy iframes', () => {
	it('builds the src from data-iframely-url and uses native lazy loading when supported', () => {
		iframely.SUPPORT_IFRAME_LOADING_ATTR = true;
		const ready = vi.fn();
		iframely.on('iframe-ready', ready);

		iframely.trigger('load');

		const src = decodeURIComponent(iframe().getAttribute('src')!);
		expect(src).toContain('cdn.iframe.ly/abc123');
		expect(src).toContain('url=https://x.example');
		expect(src).toContain('v=1');
		expect(src).toContain('app=1');
		expect(src).not.toContain('lazy=1');
		expect(iframe().getAttribute('loading')).toBe('lazy');
		expect(iframe().hasAttribute('data-iframely-url')).toBe(false);
		expect(ready).toHaveBeenCalledWith(iframe());
	});

	it('falls back to the server-side lazy mode without native support', () => {
		iframely.SUPPORT_IFRAME_LOADING_ATTR = false;

		iframely.trigger('load');

		expect(iframe().getAttribute('src')).toContain('lazy=1');
		expect(iframe().hasAttribute('loading')).toBe(false);
	});

	it('passes the configured theme to the iframe', () => {
		iframely.config = { intersection: 1, theme: 'dark' };

		iframely.trigger('load');

		expect(iframe().getAttribute('src')).toContain('theme=dark');
	});

	it('leaves iframes that already have a src alone', () => {
		iframe().setAttribute('src', 'https://cdn.iframe.ly/already');

		iframely.trigger('load');

		expect(iframe().getAttribute('src')).toBe('https://cdn.iframe.ly/already');
		expect(iframe().hasAttribute('data-iframely-url')).toBe(true);
	});
});

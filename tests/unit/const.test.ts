import { afterEach, describe, expect, it } from 'vitest';
import iframely from '../../src/iframely';
import { boot as bootConst } from '../../src/const';

const iframeProto = HTMLIFrameElement.prototype as unknown as Record<string, unknown>;

describe('const', () => {
	afterEach(() => {
		delete iframeProto.loading;
	});

	it('feature-detects native <iframe loading="lazy"> support', () => {
		// jsdom does not implement the attribute.
		bootConst();
		expect(iframely.SUPPORT_IFRAME_LOADING_ATTR).toBe(false);

		Object.defineProperty(iframeProto, 'loading', {
			configurable: true,
			writable: true,
			value: 'eager'
		});
		bootConst();
		expect(iframely.SUPPORT_IFRAME_LOADING_ATTR).toBe(true);
	});

	it('installs fresh constants on every boot', () => {
		bootConst();
		const domains = iframely.DOMAINS;
		bootConst();
		expect(iframely.DOMAINS).toEqual(domains);
		expect(iframely.DOMAINS).not.toBe(domains);
	});

	it('keeps a CDN that was set before boot and resets everything else', () => {
		iframely.CDN = 'my.cdn.example';
		iframely.VERSION = 42;
		bootConst();
		expect(iframely.CDN).toBe('my.cdn.example');
		expect(iframely.VERSION).toBe(1);
		expect(iframely.DOMAINS).toEqual([
			'cdn.iframe.ly',
			'iframe.ly',
			'if-cdn.com',
			'iframely.net'
		]);
	});
});

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
});

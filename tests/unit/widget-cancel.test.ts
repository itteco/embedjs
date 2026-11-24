import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import iframely from '../../src/iframely';
import { boot as bootConst } from '../../src/const';
import { boot as bootEvents } from '../../src/events';
import { boot as bootUtils, getWidget } from '../../src/utils';
import { boot as bootWidgetCancel } from '../../src/widget-cancel';

beforeAll(() => {
	bootConst();
	bootEvents();
	bootUtils();
	bootWidgetCancel();
});

beforeEach(() => {
	iframely.config = {};
	document.body.innerHTML =
		'<div class="host"><div class="iframely-embed"><div class="iframely-responsive">' +
		'<iframe src="https://cdn.iframe.ly/abc"></iframe>' +
		'</div></div></div>';
});

function builtWidget() {
	return getWidget(document.querySelector('iframe')!)!;
}

describe('cancelWidget', () => {
	it('removes the widget and triggers unload-widget for it', () => {
		const widget = builtWidget();
		const perWidget = vi.fn();
		iframely.on('unload-widget', perWidget);

		iframely.cancelWidget(widget);

		expect(document.querySelector('.iframely-embed')).toBeNull();
		expect(perWidget).toHaveBeenCalledTimes(1);
		expect(perWidget.mock.calls[0][0]).toBe(widget);
	});

	it('removes the configured parent wrapper with the widget', () => {
		iframely.config.parent = 'host';

		iframely.cancelWidget(builtWidget());

		expect(document.querySelector('.host')).toBeNull();
	});

	it('does not throw for a widget that is already detached', () => {
		const widget = builtWidget();
		widget.maxWidthWrapper.remove();

		expect(() => iframely.cancelWidget(widget)).not.toThrow();
	});
});

describe('link recovery on cancel', () => {
	const PAGE_URL = 'https://example.com/page';

	// A widget as ahref.ts builds it: the url kept on the widget, the text
	// of the original <a> copied into the iframe.
	function cancel(text: string) {
		document.querySelector('iframe')!.textContent = text;
		iframely.cancelWidget({ ...builtWidget(), url: PAGE_URL });
	}

	beforeEach(() => {
		iframely.RECOVER_HREFS_ON_CANCEL = false;
		document.querySelector('.host')!.append(document.createElement('p'));
	});

	it('puts a link with the original text where the widget was', async () => {
		cancel('Read the page');

		const link = await vi.waitFor(() => {
			const a = document.querySelector('.host a');
			expect(a).not.toBeNull();
			return a!;
		});
		expect(link.getAttribute('href')).toBe(PAGE_URL);
		expect(link.getAttribute('target')).toBe('_blank');
		expect(link.getAttribute('rel')).toBe('noopener');
		expect(link.textContent).toBe('Read the page');
		expect(link.nextElementSibling!.tagName).toBe('P');
	});

	it('leaves nothing for a link without text', async () => {
		const cancelled = vi.fn();
		const off = iframely.on('cancel', cancelled);

		cancel('');

		await vi.waitFor(() => expect(cancelled).toHaveBeenCalledTimes(1));
		off();
		expect(document.querySelector('.host a')).toBeNull();
	});

	it('uses the URL as the text with RECOVER_HREFS_ON_CANCEL', async () => {
		iframely.RECOVER_HREFS_ON_CANCEL = true;

		cancel('');

		await vi.waitFor(() => expect(document.querySelector('.host a')).not.toBeNull());
		expect(document.querySelector('.host a')!.textContent).toBe(PAGE_URL);
	});

	it('puts no link back when the cancel_link config is false', async () => {
		iframely.config.cancel_link = false;
		iframely.RECOVER_HREFS_ON_CANCEL = true;
		const cancelled = vi.fn();
		const off = iframely.on('cancel', cancelled);

		cancel('Read the page');

		await vi.waitFor(() => expect(cancelled).toHaveBeenCalledTimes(1));
		off();
		expect(document.querySelector('.host a')).toBeNull();
	});
});

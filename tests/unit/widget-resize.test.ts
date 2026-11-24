import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import iframely from '../../src/iframely';
import { boot as bootConst } from '../../src/const';
import { boot as bootEvents } from '../../src/events';
import { boot as bootUtils, getWidget } from '../../src/utils';
import { boot as bootWidgetResize } from '../../src/widget-resize';

beforeAll(() => {
	bootConst();
	bootEvents();
	bootUtils();
	bootWidgetResize();
});

type SizedHandler = (iframe: Element, media: Record<string, any>) => void;

let sized: Mock<SizedHandler>;
let stop: () => void;

beforeEach(() => {
	iframely.config = {};
	document.body.innerHTML =
		'<div class="iframely-embed"><div class="iframely-responsive">' +
		'<iframe src="https://cdn.iframe.ly/abc"></iframe>' +
		'</div></div>';
	stop?.();
	sized = vi.fn<SizedHandler>();
	stop = iframely.on('iframe-sized', sized);
});

function builtWidget() {
	return getWidget(document.querySelector('iframe')!)!;
}

describe('iframe-sized event', () => {
	it('fires with the iframe and the reported media', () => {
		const widget = builtWidget();
		const media = { 'aspect-ratio': 1.5, 'max-width': 600 };

		iframely.trigger('message', widget, { method: 'setIframelyEmbedData', data: { media } });

		expect(sized).toHaveBeenCalledTimes(1);
		expect(sized).toHaveBeenCalledWith(widget.iframe, media);
	});

	it('fires synchronously, after the wrapper styles are set', () => {
		const widget = builtWidget();
		let heightSeen = '';
		const off = iframely.on('iframe-sized', () => {
			heightSeen = widget.aspectWrapper.style.height;
		});

		iframely.trigger('message', widget, {
			method: 'setIframelyWidgetSize',
			data: { media: { height: 400 } }
		});
		off();

		expect(heightSeen).toBe('400px');
	});

	it('reports a height-only resize message as media', () => {
		const widget = builtWidget();

		iframely.trigger('message', widget, { method: 'resize', height: 300 });

		expect(sized).toHaveBeenCalledWith(widget.iframe, { height: 300, 'max-width': 'keep' });
	});

	it('fires again for a report that changes nothing', () => {
		const widget = builtWidget();
		const message = { method: 'resize', height: 300 };

		iframely.trigger('message', widget, message);
		iframely.trigger('message', widget, message);

		expect(sized).toHaveBeenCalledTimes(2);
	});

	it('does not fire for messages that carry no size', () => {
		const widget = builtWidget();

		// Resets the frame style only.
		iframely.trigger('message', widget, { method: 'setIframelyEmbedData' });
		iframely.trigger('message', widget, {
			method: 'setIframelyEmbedData',
			data: { media: {} }
		});
		iframely.trigger('message', widget, { method: 'setIframelyEmbedOptions', data: {} });
		iframely.trigger('message', widget, { method: 'cancelWidget', height: 300 });

		expect(sized).not.toHaveBeenCalled();
	});

	it('does not fire for an iframe without the widget wrappers', () => {
		iframely.trigger('message', undefined, { method: 'resize', height: 300 });

		expect(sized).not.toHaveBeenCalled();
	});
});

describe('height-changed event', () => {
	// jsdom has no layout: report the computed heights the two reads inside
	// widgetResize would see, before and after the styles are set.
	function computedHeights(before: string, after: string) {
		const read = vi.fn().mockReturnValueOnce(before).mockReturnValue(after);
		return vi
			.spyOn(window, 'getComputedStyle')
			.mockImplementation(
				() => ({ getPropertyValue: read }) as unknown as CSSStyleDeclaration
			);
	}

	it('fires on the next frame with the old and the new height', async () => {
		const widget = builtWidget();
		const changed = vi.fn();
		const off = iframely.on('height-changed', changed);
		const spy = computedHeights('140px', '300px');

		iframely.trigger('message', widget, { method: 'resize', height: 300 });
		spy.mockRestore();
		expect(changed).not.toHaveBeenCalled();

		await vi.waitFor(() =>
			expect(changed).toHaveBeenCalledWith(widget.iframe, '140px', '300px')
		);
		off();
	});

	it('does not fire when the height stays the same', async () => {
		const widget = builtWidget();
		const changed = vi.fn();
		const off = iframely.on('height-changed', changed);
		const spy = computedHeights('300px', '300px');

		iframely.trigger('message', widget, { method: 'resize', height: 300 });
		spy.mockRestore();

		await new Promise((resolve) => requestAnimationFrame(resolve));
		expect(changed).not.toHaveBeenCalled();
		expect(sized).toHaveBeenCalledTimes(1);
		off();
	});

	it('still fires the deprecated heightChanged, after height-changed', async () => {
		const widget = builtWidget();
		const calls: string[] = [];
		const offNew = iframely.on('height-changed', () => calls.push('height-changed'));
		const legacy = vi.fn(() => calls.push('heightChanged'));
		const offOld = iframely.on('heightChanged', legacy);
		const spy = computedHeights('140px', '300px');

		iframely.trigger('message', widget, { method: 'resize', height: 300 });
		spy.mockRestore();

		await vi.waitFor(() =>
			expect(legacy).toHaveBeenCalledWith(widget.iframe, '140px', '300px')
		);
		expect(calls).toEqual(['height-changed', 'heightChanged']);
		offNew();
		offOld();
	});
});

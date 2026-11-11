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

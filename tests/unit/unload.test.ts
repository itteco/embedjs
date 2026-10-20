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
	iframely.config = {};
	document.body.innerHTML = '';
});

function widgetHtml(src: string): string {
	return (
		'<div class="iframely-embed"><div class="iframely-responsive">' +
		'<iframe src="' +
		src +
		'"></iframe>' +
		'</div></div>'
	);
}

describe('unload', () => {
	it('removes all built widgets from the document', () => {
		document.body.innerHTML =
			widgetHtml('https://cdn.iframe.ly/api/iframe?url=https%3A%2F%2Fx.com') +
			widgetHtml('https://iframely.net/abc123') +
			'<iframe id="foreign" src="https://example.com/other"></iframe>';

		iframely.unload();

		expect(document.querySelectorAll('.iframely-embed')).toHaveLength(0);
		// Non-Iframely iframes are left alone.
		expect(document.getElementById('foreign')).not.toBeNull();
	});

	it('removes lazy widgets that have not loaded yet (data-iframely-url)', () => {
		document.body.innerHTML =
			'<div class="iframely-embed"><div class="iframely-responsive">' +
			'<iframe data-iframely-url="//cdn.iframe.ly/abc?api_key=k"></iframe>' +
			'</div></div>';

		iframely.unload();

		expect(document.querySelectorAll('.iframely-embed')).toHaveLength(0);
	});

	it('scopes removal to a container when one is given', () => {
		document.body.innerHTML =
			'<div id="a">' +
			widgetHtml('https://cdn.iframe.ly/one') +
			'</div>' +
			'<div id="b">' +
			widgetHtml('https://cdn.iframe.ly/two') +
			'</div>';

		iframely.unload(document.getElementById('a')!);

		expect(document.querySelectorAll('#a .iframely-embed')).toHaveLength(0);
		expect(document.querySelectorAll('#b .iframely-embed')).toHaveLength(1);
	});

	it('leaves widgets without the library wrapper structure alone', () => {
		document.body.innerHTML = '<div><iframe src="https://cdn.iframe.ly/xyz"></iframe></div>';

		iframely.unload();

		expect(document.querySelectorAll('iframe')).toHaveLength(1);
	});

	it('triggers unload-widget per widget and a final unload event', () => {
		document.body.innerHTML = widgetHtml('https://cdn.iframe.ly/one');
		const perWidget = vi.fn();
		const done = vi.fn();
		iframely.on('unload-widget', perWidget);
		iframely.on('unload', done);

		iframely.unload();

		expect(perWidget).toHaveBeenCalledTimes(1);
		expect(perWidget.mock.calls[0][0].iframe).toBeInstanceOf(HTMLIFrameElement);
		expect(done).toHaveBeenCalledWith(undefined);
	});

	it('resets transient import state on a full unload', () => {
		iframely.import = document.createElement('script');

		iframely.unload();

		expect(iframely.import).toBeUndefined();
	});
});

describe('unload with a custom parent', () => {
	it('removes the configured parent wrapper, like cancelWidget does', () => {
		iframely.config = { parent: 'my-wrap' };
		document.body.innerHTML =
			'<div class="my-wrap">' +
			widgetHtml('https://cdn.iframe.ly/one') +
			'</div>' +
			'<div class="my-wrap"><p>unrelated</p></div>';

		iframely.unload();

		expect(document.querySelectorAll('.iframely-embed')).toHaveLength(0);
		// Only the wrapper that held a widget is gone.
		expect(document.querySelectorAll('.my-wrap')).toHaveLength(1);
		expect(document.querySelector('.my-wrap p')).not.toBeNull();
	});
});

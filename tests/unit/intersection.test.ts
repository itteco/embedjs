import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import iframely from '../../src/iframely';
import { boot as bootConst } from '../../src/const';
import { boot as bootEvents } from '../../src/events';
import { boot as bootIntersection } from '../../src/intersection';
import { boot as bootUtils } from '../../src/utils';

const observe = vi.fn();
const unobserve = vi.fn();
const disconnect = vi.fn();
const instances: { callback: IntersectionObserverCallback; options?: IntersectionObserverInit }[] =
	[];

beforeAll(() => {
	// jsdom has no IntersectionObserver.
	vi.stubGlobal(
		'IntersectionObserver',
		class {
			observe = observe;
			unobserve = unobserve;
			disconnect = disconnect;
			constructor(
				callback: IntersectionObserverCallback,
				options?: IntersectionObserverInit
			) {
				instances.push({ callback: callback, options: options });
			}
		}
	);
	bootConst();
	bootEvents();
	bootUtils();
	bootIntersection();
});

beforeEach(() => {
	// Drops the observers of the previous test, then forget those calls.
	iframely.trigger('unload');
	observe.mockClear();
	unobserve.mockClear();
	disconnect.mockClear();
	instances.length = 0;
});

function sendIntersections(widget: unknown, options?: Record<string, unknown>): void {
	iframely.trigger('message', widget, { method: 'send-intersections', options: options });
}

describe('intersection', () => {
	it('observes the widget iframe on a send-intersections message', () => {
		const iframe = document.createElement('iframe');
		sendIntersections({ iframe: iframe });
		expect(observe).toHaveBeenCalledWith(iframe);
	});

	it('ignores send-intersections from an iframe without the wrapper structure', () => {
		// messaging.ts passes an undefined widget when getWidget() finds no wrapper.
		expect(() => sendIntersections(undefined)).not.toThrow();
		expect(observe).not.toHaveBeenCalled();
	});

	it('defaults to a 1000px margin and passes margin and threshold through', () => {
		sendIntersections({ iframe: document.createElement('iframe') });
		expect(instances[0].options).toEqual({ rootMargin: '1000px 1000px 1000px 1000px' });

		sendIntersections(
			{ iframe: document.createElement('iframe') },
			{ margin: 50, threshold: [0, 1] }
		);
		expect(instances[1].options).toEqual({
			rootMargin: '50px 50px 50px 50px',
			threshold: [0, 1]
		});
	});

	it('shares one observer per distinct options', () => {
		sendIntersections({ iframe: document.createElement('iframe') }, { margin: 50 });
		sendIntersections({ iframe: document.createElement('iframe') }, { margin: 50 });
		expect(instances).toHaveLength(1);
		expect(observe).toHaveBeenCalledTimes(2);
	});

	it('posts intersection entries to the iframe with the options echoed', () => {
		const iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		const post = vi.spyOn(iframe.contentWindow!, 'postMessage');
		sendIntersections({ iframe: iframe }, { margin: 10 });

		instances[0].callback(
			[{ isIntersecting: true, target: iframe } as unknown as IntersectionObserverEntry],
			{} as IntersectionObserver
		);

		expect(post).toHaveBeenCalledTimes(1);
		const [data, origin] = post.mock.calls[0];
		expect(origin).toBe('*');
		expect(JSON.parse(data as string)).toMatchObject({
			method: 'intersection',
			entry: { isIntersecting: true },
			options: { margin: 10 }
		});
	});

	it('releases an unloaded widget and drops all observers on a full unload', () => {
		const iframe = document.createElement('iframe');
		sendIntersections({ iframe: iframe }, { margin: 10 });
		sendIntersections({ iframe: document.createElement('iframe') }, { margin: 20 });

		iframely.trigger('unload-widget', { iframe: iframe });
		expect(unobserve).toHaveBeenCalledTimes(2);
		expect(unobserve).toHaveBeenCalledWith(iframe);

		iframely.trigger('unload');
		expect(disconnect).toHaveBeenCalledTimes(2);
		// A later message gets a fresh observer.
		sendIntersections({ iframe: document.createElement('iframe') }, { margin: 10 });
		expect(instances).toHaveLength(3);
	});

	// Frameworks often detach the DOM before running cleanup (Svelte teardown,
	// React effect cleanup after unmount); unload(container) must still
	// release what the widgets hold.
	it('releases a widget whose container is already detached', () => {
		const container = document.createElement('div');
		container.innerHTML =
			'<div class="iframely-embed"><div class="iframely-responsive">' +
			'<iframe src="https://cdn.iframe.ly/abc"></iframe></div></div>';
		document.body.appendChild(container);
		const iframe = container.querySelector('iframe')!;
		sendIntersections({ iframe: iframe });
		expect(observe).toHaveBeenCalledWith(iframe);

		container.remove();
		const perWidget = vi.fn();
		iframely.on('unload-widget', perWidget);

		expect(() => iframely.unload(container)).not.toThrow();
		expect(perWidget).toHaveBeenCalledTimes(1);
		expect(unobserve).toHaveBeenCalledWith(iframe);
		expect(container.querySelector('.iframely-embed')).toBeNull();
	});
});

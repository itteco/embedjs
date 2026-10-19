import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import iframely from '../../src/iframely';
import { boot as bootConst } from '../../src/const';
import { boot as bootEvents } from '../../src/events';
import { boot as bootIntersection } from '../../src/intersection';

const observe = vi.fn();
const unobserve = vi.fn();
const disconnect = vi.fn();

beforeAll(() => {
	// jsdom has no IntersectionObserver.
	vi.stubGlobal(
		'IntersectionObserver',
		class {
			observe = observe;
			unobserve = unobserve;
			disconnect = disconnect;
		}
	);
	bootConst();
	bootEvents();
	bootIntersection();
});

beforeEach(() => {
	observe.mockClear();
	unobserve.mockClear();
	disconnect.mockClear();
});

describe('intersection', () => {
	it('observes the widget iframe on a send-intersections message', () => {
		const iframe = document.createElement('iframe');
		iframely.trigger('message', { iframe: iframe }, { method: 'send-intersections' });
		expect(observe).toHaveBeenCalledWith(iframe);
	});

	it('ignores send-intersections from an iframe without the wrapper structure', () => {
		// messaging.ts passes an undefined widget when getWidget() finds no wrapper.
		expect(() =>
			iframely.trigger('message', undefined, { method: 'send-intersections' })
		).not.toThrow();
		expect(observe).not.toHaveBeenCalled();
	});
});

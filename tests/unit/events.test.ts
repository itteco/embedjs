import { beforeAll, describe, expect, it, vi } from 'vitest';
import iframely from '../../src/iframely';
import { boot as bootEvents } from '../../src/events';

beforeAll(() => {
	bootEvents();
});

describe('events', () => {
	it('calls handlers synchronously with trigger, in registration order', () => {
		const calls: string[] = [];
		iframely.on('sync-test', () => calls.push('first'));
		iframely.on('sync-test', () => calls.push('second'));

		iframely.trigger('sync-test');
		expect(calls).toEqual(['first', 'second']);
	});

	it('passes trigger arguments and binds this to the singleton', () => {
		const cb = vi.fn();
		iframely.on('args-test', cb);

		iframely.trigger('args-test', 1, 'two', { three: 3 });
		expect(cb).toHaveBeenCalledWith(1, 'two', { three: 3 });
		expect(cb.mock.contexts[0]).toBe(iframely);
	});

	it('does not call handlers of other events', () => {
		const cb = vi.fn();
		iframely.on('event-a', cb);
		iframely.trigger('event-b');
		expect(cb).not.toHaveBeenCalled();
	});

	it('triggerAsync defers handlers to the next animation frame', async () => {
		const cb = vi.fn();
		iframely.on('async-test', cb);

		iframely.triggerAsync('async-test', 42);
		expect(cb).not.toHaveBeenCalled();

		await vi.waitFor(() => expect(cb).toHaveBeenCalledWith(42));
	});

	it('on returns a function that removes the subscription', () => {
		const cb = vi.fn();
		const unsubscribe = iframely.on('unsubscribe-test', cb);

		iframely.trigger('unsubscribe-test');
		unsubscribe();
		iframely.trigger('unsubscribe-test');
		expect(cb).toHaveBeenCalledTimes(1);
	});

	it('an unsubscribe function removes only its own registration, once', () => {
		const cb = vi.fn();
		const first = iframely.on('twice-test', cb);
		iframely.on('twice-test', cb);

		first();
		// Calling it again must not take the second registration with it.
		first();
		iframely.trigger('twice-test');
		expect(cb).toHaveBeenCalledTimes(1);
	});

	it('off removes every subscription of the callback, and only that callback', () => {
		const cb = vi.fn();
		const other = vi.fn();
		iframely.on('off-test', cb);
		iframely.on('off-test', other);
		iframely.on('off-test', cb);

		iframely.off('off-test', cb);
		iframely.trigger('off-test');
		expect(cb).not.toHaveBeenCalled();
		expect(other).toHaveBeenCalledTimes(1);
	});

	it('off ignores unknown events and callbacks', () => {
		const cb = vi.fn();
		iframely.on('off-unknown-test', cb);

		expect(() => {
			iframely.off('never-subscribed', cb);
			iframely.off('off-unknown-test', () => {});
		}).not.toThrow();
		iframely.trigger('off-unknown-test');
		expect(cb).toHaveBeenCalledTimes(1);
	});

	it('a handler that unsubscribes itself does not make the next one skip', () => {
		const calls: string[] = [];
		const unsubscribe = iframely.on('self-remove-test', () => {
			calls.push('first');
			unsubscribe();
		});
		iframely.on('self-remove-test', () => calls.push('second'));

		iframely.trigger('self-remove-test');
		iframely.trigger('self-remove-test');
		expect(calls).toEqual(['first', 'second', 'second']);
	});

	it('a handler removed by an earlier one is not called in the same dispatch', () => {
		const later = vi.fn();
		iframely.on('remove-later-test', () => iframely.off('remove-later-test', later));
		iframely.on('remove-later-test', later);

		iframely.trigger('remove-later-test');
		expect(later).not.toHaveBeenCalled();
	});

	it('a handler added during a dispatch waits for the next one', () => {
		const added = vi.fn();
		const unsubscribe = iframely.on('add-during-test', () => {
			unsubscribe();
			iframely.on('add-during-test', added);
		});

		iframely.trigger('add-during-test');
		expect(added).not.toHaveBeenCalled();
		iframely.trigger('add-during-test');
		expect(added).toHaveBeenCalledTimes(1);
	});

	it('triggerAsync skips a handler removed before its frame', async () => {
		const removed = vi.fn();
		const kept = vi.fn();
		const unsubscribe = iframely.on('async-off-test', removed);
		iframely.on('async-off-test', kept);

		iframely.triggerAsync('async-off-test');
		unsubscribe();

		await vi.waitFor(() => expect(kept).toHaveBeenCalledTimes(1));
		expect(removed).not.toHaveBeenCalled();
	});

	it('clears init handlers after the first init', () => {
		const cb = vi.fn();
		iframely.on('init', cb);

		iframely.trigger('init');
		iframely.trigger('init');
		expect(cb).toHaveBeenCalledTimes(1);
	});
});

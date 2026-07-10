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
        let seenArgs: any[] = [];
        let seenThis: any;
        iframely.on('args-test', function(this: any, ...args: any[]) {
            seenArgs = args;
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            seenThis = this;
        });

        iframely.trigger('args-test', 1, 'two', { three: 3 });
        expect(seenArgs).toEqual([1, 'two', { three: 3 }]);
        expect(seenThis).toBe(iframely);
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

    it('clears init handlers after the first init', () => {
        const cb = vi.fn();
        iframely.on('init', cb);

        iframely.trigger('init');
        iframely.trigger('init');
        expect(cb).toHaveBeenCalledTimes(1);
    });
});

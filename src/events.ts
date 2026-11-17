import iframely from './iframely.js';

// rAF, not queueMicrotask: triggerAsync timing must stay aligned with
// layout/paint (lazy-iframe and cancel flows depend on it).
const nextTick = (fn: () => void): void => {
	window.requestAnimationFrame(fn);
};

type EventCallback = (...args: any[]) => void;

// One entry per on() call, so the same callback can be subscribed twice and
// each unsubscribe function removes only its own registration.
interface Listener {
	cb: EventCallback;
	removed?: boolean;
}

const callbacksStack: Record<string, Listener[]> = {};

function remove(event: string, match: (listener: Listener) => boolean): void {
	const events = callbacksStack[event];
	if (!events) {
		return;
	}
	// A new array, never a splice: a dispatch in progress keeps iterating
	// the one it started with.
	callbacksStack[event] = events.filter((listener) => {
		if (match(listener)) {
			listener.removed = true;
			return false;
		}
		return true;
	});
}

function trigger(event: string, async: boolean, args: any[]): void {
	const events = callbacksStack[event] || [];
	// The flag is checked at call time: a listener removed by an earlier
	// one, or before the frame of a triggerAsync, is not called any more.
	const call = (listener: Listener): void => {
		if (!listener.removed) {
			listener.cb.apply(iframely, args);
		}
	};
	events.forEach((listener) => {
		if (async) {
			nextTick(() => call(listener));
		} else {
			call(listener);
		}
	});

	if (event === 'init') {
		// everything inited, let's clear the callstack, just in case
		// TODO: not good.
		callbacksStack[event] = [];
	}
}

export function boot(): void {
	iframely.on = (event: string, cb: EventCallback) => {
		const listener: Listener = { cb };
		// Appended as a new array for the same reason remove() filters:
		// a listener added during a dispatch waits for the next one.
		callbacksStack[event] = (callbacksStack[event] || []).concat(listener);
		return () => remove(event, (l) => l === listener);
	};

	iframely.off = (event: string, cb: EventCallback) => {
		remove(event, (l) => l.cb === cb);
	};

	iframely.trigger = (event: string, ...args: any[]) => {
		trigger(event, false, args);
	};

	iframely.triggerAsync = (event: string, ...args: any[]) => {
		trigger(event, true, args);
	};
}

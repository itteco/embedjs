import iframely from './iframely.js';

// rAF, not queueMicrotask: triggerAsync timing must stay aligned with
// layout/paint (lazy-iframe and cancel flows depend on it).
const nextTick = (fn: () => void): void => {
	window.requestAnimationFrame(fn);
};

type EventCallback = (...args: any[]) => void;

const callbacksStack: Record<string, EventCallback[]> = {};

function trigger(event: string, async: boolean, args: any[]): void {
	const events = callbacksStack[event] || [];
	events.forEach((cb) => {
		if (async) {
			nextTick(() => {
				cb.apply(iframely, args);
			});
		} else {
			cb.apply(iframely, args);
		}
	});

	if (event === 'init') {
		// everything inited, let's clear the callstack, just in case
		// TODO: not good.
		callbacksStack[event] = [];
	}
}

export function boot(): void {
	iframely.on = (event, cb) => {
		const events = (callbacksStack[event] = callbacksStack[event] || []);
		events.push(cb);
	};

	iframely.trigger = (event, ...args) => {
		trigger(event, false, args);
	};

	iframely.triggerAsync = (event, ...args) => {
		trigger(event, true, args);
	};
}

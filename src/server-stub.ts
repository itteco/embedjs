import iframely from './iframely.js';
import { createConstants } from './constants.js';

// Turns the detached server-side singleton into an inert stub so that
// importing the npm package during server rendering is error- and
// side-effect-free: every API call is a no-op and the public constants are
// readable. Nothing may store state here: on the server one module instance
// is shared across requests. Applied only by the npm entries (main.ts,
// main-options.ts); the script-tag bundles never run on a server.
export function applyServerStub(): void {
	const noop = (): void => {};
	Object.assign(iframely, createConstants(), {
		on: noop,
		trigger: noop,
		triggerAsync: noop,
		load: noop,
		unload: noop,
		configure: noop,
		extendOptions: noop,
		setTheme: noop,
		cancelWidget: noop,
		openHref: noop,
		addEventListener: noop,
		isTouch: () => false,
		findIframe: () => undefined,
		getElementComputedStyle: () => undefined,
		buildOptionsForm: noop,
		// Pre-2.0 namespaces, see deprecated.ts.
		widgets: { load: noop },
		events: { on: noop, trigger: noop }
	});
}

import type { Iframely } from './types';
import { createConstants } from './constants';

// In server (SSR) environments the singleton is a detached, inert stub so
// that importing the package is error- and side-effect-free: every API call
// is a no-op and the public constants are readable until the code runs in a
// browser. Nothing may store state here: on the server one module instance
// is shared across requests.
function createServerStub(): Iframely {
	const noop = (): void => {};
	return {
		...createConstants(),
		config: {},
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
	} as unknown as Iframely;
}

// In the browser, the window.iframely singleton is the library's only global
// exposure and the only state shared between separately loaded bundles
// (embed, options, i18n). Another bundle may have created it already — never
// overwrite.
const iframely: Iframely =
	typeof window === 'undefined'
		? createServerStub()
		: (window.iframely = window.iframely || ({} as Iframely));
iframely.config = iframely.config || {};

export default iframely;

import type { Iframely } from './types.js';

// In the browser, the window.iframely singleton is the library's only global
// exposure and the only state shared between separately loaded bundles
// (embed, options, i18n). Another bundle may have created it already — never
// overwrite.
//
// Without a window (server-side rendering) this is a detached bare object.
// The npm entries turn it into an inert stub (see server-stub.ts); the
// script-tag bundles never run on a server and carry no stub code.
const iframely: Iframely =
	typeof window === 'undefined'
		? ({} as Iframely)
		: (window.iframely = window.iframely || ({} as Iframely));
iframely.config = iframely.config || {};

export default iframely;

// Public ESM entry for npm/bundler consumers of the embed library.
// Unlike the embed.js script tag, it does NOT auto-run on DOMContentLoaded:
// call iframely.load() to scan the DOM and build embeds. To restore the
// script-tag behavior, call iframely.configure({ autorun: true }) right after
// importing (or pre-set `window.iframely = { config: { autorun: true } }`).
import './index.js';
import iframely from './iframely.js';
import { setAutorunDefault } from './dom-ready.js';
import { applyServerStub } from './server-stub.js';

// dom-ready checks autorun when DOMContentLoaded fires (or on the macrotask
// after import for already-loaded documents), so switching this copy's
// default off here is in time. It is not written to the shared
// iframely.config: another embed.js on the page keeps its own default.
// On the server the singleton becomes an inert stub instead.
if (typeof window === 'undefined') {
	applyServerStub();
} else {
	setAutorunDefault(false);
}

export { iframely };
export type * from './types.js';

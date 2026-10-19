// Public ESM entry for npm/bundler consumers of the embed library.
// Unlike the embed.js script tag, it does NOT auto-run on DOMContentLoaded:
// call iframely.load() to scan the DOM and build embeds. To restore the
// script-tag behavior, call iframely.configure({ autorun: true }) right after
// importing (or pre-set `window.iframely = { config: { autorun: true } }`).
import './index.js';
import iframely from './iframely.js';

// dom-ready checks autorun when DOMContentLoaded fires (or on the macrotask
// after import for already-loaded documents), so setting it here is in time.
// On the server the singleton is an inert stub — leave it untouched.
if (typeof window !== 'undefined') {
	iframely.config.autorun = iframely.config.autorun ?? false;
}

export { iframely };
export type * from './types.js';

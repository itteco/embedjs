// Public ESM entry for npm/bundler consumers: embed + options form builder.
// Unlike the embed-options.js script tag, it does NOT auto-run on
// DOMContentLoaded: call iframely.load() to scan the DOM and build embeds.
// To restore the script-tag behavior, call iframely.configure({ autorun: true })
// right after importing (or pre-set `window.iframely = { config: { autorun: true } }`).
import './index-options';
import iframely from './iframely';

if (typeof window !== 'undefined') {
	iframely.config.autorun = iframely.config.autorun ?? false;
}

export { iframely };
export type * from './types';

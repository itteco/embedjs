import iframely from './iframely.js';

// What this copy of the library does when `config.autorun` is not set. The
// script-tag bundles scan the page; the npm entries switch their own default
// off. It is per copy on purpose: `window.iframely.config` is shared with any
// other embed.js on the page (a 1.x cloud script included), and writing the
// npm default there would silently stop that copy from auto-running.
let autorunDefault = true;

export function setAutorunDefault(value: boolean): void {
	autorunDefault = value;
}

const DOMReady = (f: () => void): void => {
	if (document.readyState === 'complete' || document.readyState === 'interactive') {
		// Run always (in case of async script).
		setTimeout(f, 0);
	}
	document.addEventListener('DOMContentLoaded', f);
};

// Runs at import time, outside the entries' `_loaded` guard — each loaded
// bundle announces itself, exactly like the old per-bundle require did.
// Skipped on the server, where there is no document (SSR-safe import).
if (typeof document !== 'undefined') {
	DOMReady(() => {
		// Called each time on script load. An explicit config.autorun (pre-set
		// or through configure()) wins over this copy's default.
		const autorun = iframely.config.autorun ?? autorunDefault;
		if (autorun !== false) {
			iframely.trigger('load');
		}
	});
}

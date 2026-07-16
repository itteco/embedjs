import iframely from './iframely';

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
		// Called each time on script load
		if (typeof iframely.config.autorun === 'undefined' || iframely.config.autorun !== false) {
			iframely.trigger('load');
		}
	});
}

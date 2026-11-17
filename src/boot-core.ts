import iframely from './iframely.js';
import { CORE_API, LIB_VERSION } from './constants.js';
import { boot as bootConst } from './const.js';
import { boot as bootEvents } from './events.js';
import { boot as bootUtils } from './utils.js';
import { boot as bootMessaging } from './messaging.js';
import { boot as bootIntersection } from './intersection.js';
import { boot as bootTheme } from './theme.js';
import { boot as bootImport } from './import.js';
import { boot as bootAhref } from './ahref.js';
import { boot as bootLazyImgPlaceholder } from './lazy-img-placeholder.js';
import { boot as bootLazyIframe } from './lazy-iframe.js';
import { boot as bootWidgetCancel } from './widget-cancel.js';
import { boot as bootWidgetResize } from './widget-resize.js';
import { boot as bootWidgetClick } from './widget-click.js';
import { boot as bootWidgetOptions } from './widget-options.js';
import { boot as bootDeprecated } from './deprecated.js';

// ESM hoists imports, so unlike the old CJS entry a guard cannot skip module
// evaluation. Modules therefore defer all singleton mutations and listener
// registrations to their boot() functions, and bootCore() runs those once
// per page: when several bundles share a page (e.g. embed.js + options.js),
// only the first one boots the core and triggers 'init'. On the server
// nothing boots at all — the singleton stays an inert stub (SSR-safe import).
// Returns whether this call booted the core.
export function bootCore(): boolean {
	if (typeof window === 'undefined') {
		return false;
	}
	if (iframely._loaded) {
		warnIfForeignCore();
		return false;
	}
	iframely._loaded = true;

	bootConst();
	bootEvents();
	// utils and messaging boot before the modules that were pulling them in
	// transitively under CJS, preserving 'init' handler registration order.
	bootUtils();
	bootMessaging();
	bootIntersection();
	bootTheme();
	bootImport();
	bootAhref();
	bootLazyImgPlaceholder();
	bootLazyIframe();
	bootWidgetCancel();
	bootWidgetResize();
	bootWidgetClick();
	bootWidgetOptions();
	bootDeprecated();

	iframely.trigger('init');
	return true;
}

let warnedForeignCore = false;

// Several bundles share one core by design (embed.js + embed-options.js, or
// the cloud script + the npm module). This copy cannot boot onto a core that
// another copy booted: that copy's listeners and widgets live in its own
// closure. So when the shared core is not one this copy can rely on, say so
// once instead of leaving the page to a bare "... is not a function":
// - it lacks methods this copy provides (a 1.x core, typically the cloud
//   embed.js that Iframely API embed codes append, or an older release of
//   this major missing a newer method);
// - or it reports a different major version, whose methods may behave
//   differently even where the names match.
function warnIfForeignCore(): void {
	if (warnedForeignCore) {
		return;
	}
	const missing = CORE_API.filter((name) => typeof iframely[name] !== 'function');
	const theirs: unknown = iframely.LIB_VERSION;
	const otherMajor = typeof theirs === 'string' && major(theirs) !== major(LIB_VERSION);
	if (!missing.length && !otherMajor) {
		return;
	}
	warnedForeignCore = true;
	const owner =
		typeof theirs === 'string'
			? 'embed.js ' + theirs
			: 'an embed.js without LIB_VERSION (1.x or 2.0.0-next.1)';
	const problem = missing.length
		? 'its core lacks ' +
			missing.map((name) => name + '()').join(', ') +
			', so calls to them will fail'
		: 'it is a different major version, so its methods may not behave as this version documents';
	console.warn(
		`[iframely] embed.js ${LIB_VERSION} found window.iframely already initialised by ${owner} ` +
			`and did not start; ${problem}. Load a single copy: remove the other ` +
			'<script src=".../embed.js"> (request API embed codes with omit_script=1) or load this one first.'
	);
}

function major(version: string): string {
	return version.split('.')[0];
}

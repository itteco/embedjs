import iframely from './iframely.js';
import { LIB_VERSION } from './constants.js';
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

// Several bundles of the same major version share one core by design
// (embed.js + embed-options.js, or the cloud script + the npm module). A core
// booted by another major version — typically the 1.x cloud embed.js that
// Iframely API embed codes append — keeps that version's methods: this copy
// cannot boot onto it (the other copy's listeners and widgets live in its own
// closure) and its 2.0 APIs (unload, configure, ...) are missing. Say so once
// instead of leaving the page to a bare "... is not a function".
function warnIfForeignCore(): void {
	const theirs: unknown = iframely.LIB_VERSION;
	if (warnedForeignCore || (typeof theirs === 'string' && major(theirs) === major(LIB_VERSION))) {
		return;
	}
	warnedForeignCore = true;
	const owner =
		typeof theirs === 'string' ? 'embed.js ' + theirs : 'a pre-2.0 embed.js (or 2.0.0-next.1)';
	console.warn(
		`[iframely] embed.js ${LIB_VERSION} found window.iframely already initialised by ${owner} ` +
			'and did not start; unload(), configure() and other APIs of this version may be unavailable. ' +
			'Load a single copy: remove the other <script src=".../embed.js"> (request API embed codes ' +
			'with omit_script=1) or load this one first.'
	);
}

function major(version: string): string {
	return version.split('.')[0];
}

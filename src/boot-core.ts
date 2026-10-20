import iframely from './iframely.js';
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
	if (typeof window === 'undefined' || iframely._loaded) {
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

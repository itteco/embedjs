import './dom-ready.js';
import { bootCore } from './boot-core.js';
import { boot as bootOptions } from './options/index.js';

// The core boots once per page (see boot-core.ts). The options subsystem is
// not part of that guard: it must be present even when a plain embed bundle
// booted the core first (embed.js followed by embed-options.js, or the base
// npm entry imported before the options entry), and a later options bundle
// overwrites buildOptionsForm exactly like the pre-2.0 bundles did. Options
// boot before 'init' to keep the pre-2.0 order.
if (typeof window !== 'undefined') {
	bootOptions();
}
bootCore();

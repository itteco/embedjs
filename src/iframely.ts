import type { Iframely } from './types';

// The window.iframely singleton is the library's only global exposure and the
// only state shared between separately loaded bundles (embed, options, i18n).
// Another bundle may have created it already — never overwrite.
const iframely: Iframely = window.iframely = window.iframely || ({} as Iframely);
iframely.config = iframely.config || {};

export default iframely;

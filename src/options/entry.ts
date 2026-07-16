// Entry for the standalone options.js bundle. Unlike embed entries it runs
// unguarded — a later-loaded options bundle overwrites buildOptionsForm,
// exactly like the original CJS bundle did. It relies on an embed bundle
// being loaded on the page for events (trigger/on) and addEventListener.
import { boot } from './index';

boot();

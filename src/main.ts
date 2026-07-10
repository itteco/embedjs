// Public ESM entry for npm/bundler consumers of the embed library.
// Loading it has the same side effects as the embed.js script tag.
import './index';

export { default as iframely } from './iframely';
export type * from './types';

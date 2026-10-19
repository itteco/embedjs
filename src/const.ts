import iframely from './iframely.js';
import { createConstants } from './constants.js';

export function boot(): void {
	const constants = createConstants();
	// A user script or the embed.js src may set CDN before the library boots
	// (README: "bring your own CDN"); everything else is reset on each boot.
	constants.CDN = iframely.CDN || constants.CDN;
	Object.assign(iframely, constants);
}

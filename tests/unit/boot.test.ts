import { describe, expect, it, vi } from 'vitest';

// Simulates a page that loads embed.js first and embed-options.js second
// (demo/double.html), or an app that imports '@iframely/embed.js' before
// '@iframely/embed.js/options'. The core must boot exactly once, and the
// options subsystem must boot regardless of which entry came first.
describe('bootstrap entries', () => {
	it('boots the options subsystem even when the core booted first', async () => {
		// dom-ready schedules a 'load' at import time. Vitest evaluates module
		// graphs asynchronously, so that timer could fire before events boot
		// (impossible in a real bundle); disabling autorun keeps it quiet.
		(window as any).iframely = { config: { autorun: false } };

		await import('../../src/index');
		const { default: iframely } = await import('../../src/iframely');
		expect(iframely._loaded).toBe(true);
		expect(iframely.buildOptionsForm).toBeUndefined();

		const trigger = vi.spyOn(iframely, 'trigger');
		await import('../../src/index-options');

		expect(typeof iframely.buildOptionsForm).toBe('function');
		// The core did not boot a second time.
		expect(trigger).not.toHaveBeenCalledWith('init');
	});
});

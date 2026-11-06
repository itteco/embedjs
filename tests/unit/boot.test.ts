import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LIB_VERSION } from '../../src/constants';

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
		const warn = vi.spyOn(console, 'warn');
		await import('../../src/index-options');

		expect(typeof iframely.buildOptionsForm).toBe('function');
		// Same-major sharing is the supported case: no foreign-core warning.
		expect(warn).not.toHaveBeenCalled();
		// The core did not boot a second time.
		expect(trigger).not.toHaveBeenCalledWith('init');
	});
});

// A core booted by another copy of the library owns window.iframely; this
// copy must not boot onto it, and must say so when the owner is a different
// major version (whose APIs differ) — but stay quiet for the supported
// same-major sharing above.
describe('a core booted by another copy', () => {
	const ours = (major: number) => `${major}.${LIB_VERSION.split('.').slice(1).join('.')}`;

	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		delete (window as any).iframely;
	});

	async function importWith(preset: Record<string, any>) {
		(window as any).iframely = { config: { autorun: false }, _loaded: true, ...preset };
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		await import('../../src/index');
		return warn;
	}

	it('warns once and does not boot when a pre-2.0 copy owns the singleton', async () => {
		const load = () => {};
		const warn = await importWith({ load });
		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn.mock.calls[0][0]).toContain('pre-2.0');
		expect(warn.mock.calls[0][0]).toContain('omit_script=1');
		// The 1.x object keeps its own methods and gets none of ours.
		expect((window as any).iframely.load).toBe(load);
		expect((window as any).iframely.unload).toBeUndefined();

		await import('../../src/index-options');
		expect(warn).toHaveBeenCalledTimes(1);
	});

	it('names both versions when another major owns the singleton', async () => {
		const warn = await importWith({ LIB_VERSION: ours(Number(LIB_VERSION.split('.')[0]) + 1) });
		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn.mock.calls[0][0]).toContain(LIB_VERSION);
		expect(warn.mock.calls[0][0]).toContain(ours(Number(LIB_VERSION.split('.')[0]) + 1));
	});

	it('stays silent when the same major owns the singleton', async () => {
		const warn = await importWith({
			LIB_VERSION: ours(Number(LIB_VERSION.split('.')[0])) + '-other'
		});
		expect(warn).not.toHaveBeenCalled();
	});
});

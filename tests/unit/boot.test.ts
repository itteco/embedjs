import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CORE_API, LIB_VERSION } from '../../src/constants';

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
// copy must not boot onto it, and must say so when that core lacks this
// copy's methods or reports a different major version — but stay quiet for
// the supported sharing above.
describe('a core booted by another copy', () => {
	const ourMajor = Number(LIB_VERSION.split('.')[0]);
	const withMajor = (major: number) => `${major}.${LIB_VERSION.split('.').slice(1).join('.')}`;
	const completeCore = () => Object.fromEntries(CORE_API.map((name) => [name, () => {}]));

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

	it('keeps CORE_API in sync with the methods a boot installs', async () => {
		(window as any).iframely = { config: { autorun: false } };
		await import('../../src/index');
		const core = (window as any).iframely;
		const installed = Object.keys(core)
			.filter((key) => typeof core[key] === 'function')
			.sort();
		expect(installed).toEqual([...CORE_API].sort());
	});

	it('warns once and does not boot when a 1.x copy owns the singleton', async () => {
		const load = () => {};
		const extendOptions = () => {};
		const warn = await importWith({ load, extendOptions });
		expect(warn).toHaveBeenCalledTimes(1);
		const message = warn.mock.calls[0][0];
		expect(message).toContain('without LIB_VERSION');
		expect(message).toContain('unload()');
		expect(message).toContain('configure()');
		expect(message).not.toContain('extendOptions()');
		expect(message).toContain('omit_script=1');
		// The 1.x object keeps its own methods and gets none of ours.
		expect((window as any).iframely.load).toBe(load);
		expect((window as any).iframely.unload).toBeUndefined();

		await import('../../src/index-options');
		expect(warn).toHaveBeenCalledTimes(1);
	});

	it('warns when an older release of the same major lacks a newer method', async () => {
		const { unload: _unload, ...older } = completeCore();
		const warn = await importWith({ ...older, LIB_VERSION: withMajor(ourMajor) + '-older' });
		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn.mock.calls[0][0]).toContain('lacks unload(),');
		expect(warn.mock.calls[0][0]).not.toContain('configure()');
	});

	it('names both versions when another major owns the singleton, even with every method present', async () => {
		const theirs = withMajor(ourMajor + 1);
		const warn = await importWith({ ...completeCore(), LIB_VERSION: theirs });
		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn.mock.calls[0][0]).toContain(LIB_VERSION);
		expect(warn.mock.calls[0][0]).toContain(theirs);
		expect(warn.mock.calls[0][0]).toContain('different major version');
	});

	it('stays silent when a complete core of the same major owns the singleton', async () => {
		const warn = await importWith({
			...completeCore(),
			LIB_VERSION: withMajor(ourMajor) + '-other'
		});
		expect(warn).not.toHaveBeenCalled();
	});
});

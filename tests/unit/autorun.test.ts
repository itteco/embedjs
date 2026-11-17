import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The npm entries do not auto-run, the script-tag entries do. That default
// belongs to each copy of the library: window.iframely.config is shared with
// any other embed.js on the page, so the npm entries must not write theirs
// into it.
describe('autorun default per copy', () => {
	let trigger: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.resetModules();
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
		trigger = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		delete (window as any).iframely;
	});

	// A core another copy booted (here: a 1.x one, which has no configure()).
	// This copy does not boot onto it, and announces itself through its
	// trigger.
	function foreignCore(config: Record<string, unknown>): Record<string, any> {
		return ((window as any).iframely = {
			_loaded: true,
			config: config,
			trigger: trigger,
			on: () => {},
			load: () => {},
			extendOptions: () => {}
		});
	}

	// Vitest evaluates a module graph asynchronously, so the timer dom-ready
	// sets for an already loaded document could fire before the entry's own
	// body has run, which cannot happen in a real bundle. The document is
	// therefore presented as still loading, and DOMContentLoaded fired by hand.
	const domReady = async () => {
		document.dispatchEvent(new Event('DOMContentLoaded'));
	};

	it('leaves the shared config alone when the npm entry is imported', async () => {
		const core = foreignCore({});

		await import('../../src/main');
		await domReady();

		// The other copy's own dom-ready still sees autorun as not disabled.
		expect('autorun' in core.config).toBe(false);
		// And this copy does not scan the page on its own.
		expect(trigger).not.toHaveBeenCalledWith('load');
	});

	it('does the same for the options npm entry', async () => {
		const core = foreignCore({});

		await import('../../src/main-options');
		await domReady();

		expect('autorun' in core.config).toBe(false);
		expect(trigger).not.toHaveBeenCalledWith('load');
	});

	it('auto-runs from the npm entry when config.autorun is switched on', async () => {
		foreignCore({ autorun: true });

		await import('../../src/main');
		await domReady();

		expect(trigger).toHaveBeenCalledWith('load');
	});

	it('auto-runs from a script-tag entry by default', async () => {
		foreignCore({});

		await import('../../src/index');
		await domReady();

		expect(trigger).toHaveBeenCalledWith('load');
	});

	it('does not auto-run from a script-tag entry when config.autorun is false', async () => {
		foreignCore({ autorun: false });

		await import('../../src/index');
		await domReady();

		expect(trigger).not.toHaveBeenCalledWith('load');
	});
});

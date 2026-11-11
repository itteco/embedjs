import { beforeEach, describe, expect, it, vi } from 'vitest';
import iframely from '../../src/iframely';
import { boot as bootOptions } from '../../src/options/index';

// Deliberately boots ONLY the options module — no events, no import —
// mirroring a page that loads the standalone options.js without embed.js.
describe('standalone options bundle without embed', () => {
	beforeEach(() => {
		document.body.innerHTML = '<div id="form"></div>';
		bootOptions();
	});

	it('buildOptionsForm fails silently with a warning instead of throwing', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const container = document.getElementById('form')!;

		expect(() => {
			iframely.buildOptionsForm!('id', container, {
				_hide: { label: 'Hide artwork', value: false }
			});
		}).not.toThrow();

		expect(container.innerHTML).toBe('');
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('requires embed.js'));
		warn.mockRestore();
	});
});

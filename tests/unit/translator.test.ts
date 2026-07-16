import { describe, expect, it } from 'vitest';
import iframely from '../../src/iframely';
import * as translator from '../../src/options/translator';

describe('translator', () => {
	it('assigns iframely.optionsTranslator at import time', () => {
		expect(typeof iframely.optionsTranslator).toBe('function');
	});

	it('translates registered labels', () => {
		translator.registerLabels('de', { Light: 'Hell', Dark: 'Dunkel' });
		const t = iframely.optionsTranslator!('de')!;
		expect(t('Light')).toBe('Hell');
		expect(t('Dark')).toBe('Dunkel');
	});

	it('falls back to the original label for unknown or empty translations', () => {
		translator.registerLabels('de', { Auto: '' });
		const t = iframely.optionsTranslator!('de')!;
		expect(t('Auto')).toBe('Auto');
		expect(t('Unknown label')).toBe('Unknown label');
	});

	it('returns identity for an unregistered language', () => {
		const t = iframely.optionsTranslator!('xx')!;
		expect(t('Light')).toBe('Light');
	});

	it('merges labels registered in multiple calls', () => {
		translator.registerLabels('fr', { Light: 'Lumière' });
		translator.registerLabels('fr', { Dark: 'Sombre' });
		const t = iframely.optionsTranslator!('fr')!;
		expect(t('Light')).toBe('Lumière');
		expect(t('Dark')).toBe('Sombre');
	});
});

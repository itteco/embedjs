import { describe, expect, it } from 'vitest';
import render from '../../src/options/renderer';

describe('renderer', () => {
	it('renders a checkbox with id/name/label and the checked attribute', () => {
		const html = render('checkbox', { key: '_hide', label: 'Hide artwork', checked: true });
		expect(html).toContain('type="checkbox"');
		expect(html).toContain('id="_hide"');
		expect(html).toContain('name="_hide"');
		expect(html).toContain('checked="checked"');
		expect(html).toContain('Hide artwork');

		const unchecked = render('checkbox', {
			key: '_hide',
			label: 'Hide artwork',
			checked: false
		});
		expect(unchecked).not.toContain('checked');
	});

	it('HTML-escapes scalar interpolations', () => {
		const html = render('checkbox', { key: 'k', label: '<b>"quoted" & \'raw\'</b>' });
		expect(html).not.toContain('<b>');
		expect(html).toContain('&lt;b&gt;&quot;quoted&quot; &amp; &#39;raw&#39;&lt;/b&gt;');
	});

	it('renders nullish values as empty strings', () => {
		const html = render('text', { key: 'k', label: 'L' });
		expect(html).toContain('placeholder=""');
		expect(html).toContain('value=""');
		expect(html).not.toContain('undefined');
	});

	it('injects group elementsHtml raw', () => {
		const child = render('checkbox', { key: 'c', label: 'C' });
		const html = render('group', { elementsHtml: child });
		expect(html).toContain('iframely-option__group');
		expect(html).toContain('type="checkbox"'); // not escaped
		expect(html).not.toContain('&lt;input');
	});

	it('renders radio items with per-item ids, values and checked state', () => {
		const html = render('radio', {
			key: 'theme',
			label: 'Theme color',
			inline: true,
			items: [
				{ id: 'theme-0', value: 'light', label: 'Light', checked: true },
				{ id: 'theme-1', value: 'dark', label: 'Dark', checked: false }
			]
		});
		expect(html).toContain('iframely-option__group-inline');
		expect(html).toContain('Theme color:');
		expect(html).toContain('id="theme-0"');
		expect(html).toContain('value="light" checked="checked"');
		expect(html).toContain('value="dark"');
		expect(html).not.toContain('value="dark" checked');
		expect((html.match(/name="theme"/g) || []).length).toBe(2);
	});

	it('omits the radio group label when label is false', () => {
		const html = render('radio', {
			key: 'k',
			label: false,
			items: [{ id: 'k-0', value: 'a', label: 'A', checked: false }]
		});
		expect(html).not.toContain('iframely-option__label');
		expect(html).not.toContain('iframely-option__group-inline');
	});

	it('renders select options with the selected attribute', () => {
		const html = render('select', {
			key: 'style',
			label: 'Widget style',
			items: [
				{ value: 'mini', label: 'Mini', checked: false },
				{ value: 'classic', label: 'Classic', checked: true }
			]
		});
		expect(html).toContain('<select');
		expect(html).toContain('name="style"');
		expect(html).toContain('<option value="classic" selected>Classic</option>');
		expect(html).toContain('<option value="mini">Mini</option>');
	});

	it('renders a range input with min/max/step and CSS custom properties', () => {
		const html = render('range', { key: 'h', label: 'Height', min: 100, max: 600, value: 200 });
		expect(html).toContain('type="range"');
		expect(html).toContain('min="100"');
		expect(html).toContain('max="600"');
		expect(html).toContain('step="1"');
		expect(html).toContain('value="200"');
		expect(html).toContain('style="--min: 100; --max: 600; --val: 200;"');
	});

	it('renders a text input with the requested inputType and placeholder', () => {
		const html = render('text', {
			key: 'start',
			label: 'Start from',
			inputType: 'number',
			placeholder: 'ex.: 11',
			value: 5
		});
		expect(html).toContain('type="number"');
		expect(html).toContain('placeholder="ex.: 11"');
		expect(html).toContain('value="5"');
	});
});

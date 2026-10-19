import { describe, expect, it } from 'vitest';
import getFormElements from '../../src/options/form-generator';
import type { FormElement } from '../../src/types';

function flatten(elements: FormElement[]): FormElement[] {
	return elements.flatMap((el) => (el.type === 'group' ? flatten(el.context.elements!) : [el]));
}

describe('form-generator', () => {
	it('returns an empty list without options', () => {
		expect(getFormElements(undefined)).toEqual([]);
	});

	it('drops the reserved query key', () => {
		const elements = getFormElements({ query: ['a'] });
		expect(elements).toEqual([]);
	});

	it('maps a boolean option to a checkbox with a boolean query', () => {
		const [group] = getFormElements({ _hide: { label: 'Hide artwork', value: true } });
		expect(group.type).toBe('group');
		const [checkbox] = group.context.elements!;
		expect(checkbox.type).toBe('checkbox');
		expect(checkbox.context.checked).toBe(true);
		expect(checkbox.getQuery!(false)).toEqual({ _hide: false });
	});

	it('forces a checkbox for a single key-value option and maps checked to the key', () => {
		const [group] = getFormElements({
			card: { label: 'ignored', value: '', values: { small: 'Make it a small card' } }
		});
		const [checkbox] = group.context.elements!;
		expect(checkbox.type).toBe('checkbox');
		expect(checkbox.context.label).toBe('Make it a small card');
		expect(checkbox.context.checked).toBe(false); // value '' does not match the single key
		expect(checkbox.getQuery!(true)).toEqual({ card: 'small' });
		expect(checkbox.getQuery!(false)).toEqual({});

		const [checkedGroup] = getFormElements({
			card: { value: 'small', values: { small: 'Make it a small card' } }
		});
		expect(checkedGroup.context.elements![0].context.checked).toBe(true);
	});

	it('maps a string option to a text input and a number option to a number input', () => {
		const elements = getFormElements({
			start: { label: 'Start from', value: '11', placeholder: 'ex.: 11' },
			maxheight: { label: 'Adjust height', value: 200 }
		});
		const text = elements.find((el) => el.context.key === 'start')!;
		const number = elements.find((el) => el.context.key === 'maxheight')!;
		expect(text.type).toBe('text');
		expect(text.context.inputType).toBe('text');
		expect(text.context.placeholder).toBe('ex.: 11');
		expect(number.context.inputType).toBe('number');
		expect(number.getQuery!('')).toEqual({});
		expect(number.getQuery!(300)).toEqual({ maxheight: 300 });
	});

	it('maps a ranged numeric option to a range slider ordered last', () => {
		const elements = getFormElements({
			height: { label: 'Height', value: 200, range: { min: 100, max: 600 } },
			name: { label: 'Name', value: 'x' }
		});
		expect(elements[elements.length - 1].type).toBe('range');
		expect(elements[elements.length - 1].context).toMatchObject({
			min: 100,
			max: 600,
			value: 200
		});
	});

	it('maps up to 3 values to radios and more than 3 to a select', () => {
		const [radio] = getFormElements({
			theme: {
				label: 'Theme color',
				value: 'dark',
				values: { light: 'Light', dark: 'Dark', auto: 'Auto' }
			}
		});
		expect(radio.type).toBe('radio');
		expect(radio.context.inline).toBe(true); // all labels are short
		expect(radio.context.items).toHaveLength(3);
		expect(radio.context.items![1]).toMatchObject({
			id: 'theme-1',
			value: 'dark',
			checked: true
		});

		const [select] = getFormElements({
			style: {
				label: 'Style',
				value: 'mini',
				values: { mini: 'Mini', classic: 'Classic', picture: 'Picture', big: 'Big' }
			}
		});
		expect(select.type).toBe('select');
		expect(select.context.items).toHaveLength(4);
	});

	it('disables inline radios and label for long or missing labels', () => {
		const [radio] = getFormElements({
			layout: { value: 'a', values: { a: 'A very long label indeed', b: 'B' } }
		});
		expect(radio.type).toBe('radio');
		expect(radio.context.inline).toBe(false);
		expect(radio.context.label).toBe(false);
	});

	it('groups checkboxes and starts a new group at the _-prefix boundary', () => {
		const elements = getFormElements({
			_a: { label: 'A', value: true },
			_b: { label: 'B', value: false },
			c: { label: 'C', value: true }
		});
		const groups = elements.filter((el) => el.type === 'group');
		expect(groups).toHaveLength(2);
		expect(groups[0].context.elements!.map((el) => el.context.key)).toEqual(['_a', '_b']);
		expect(groups[1].context.elements!.map((el) => el.context.key)).toEqual(['c']);
		expect(flatten(elements)).toHaveLength(3);
	});

	it('applies the translator, falling back to the original label', () => {
		const translator = (label: string) => (label === 'Light' ? 'Hell' : '');
		const [radio] = getFormElements(
			{
				theme: {
					label: 'Theme color',
					value: 'light',
					values: { light: 'Light', dark: 'Dark' }
				}
			},
			translator
		);
		expect(radio.context.items![0].label).toBe('Hell');
		expect(radio.context.items![1].label).toBe('Dark'); // empty translation falls back
	});
});

describe('form-generator: range value', () => {
	it('coerces the slider value to a number inside the range', () => {
		const slider = (value: unknown) =>
			getFormElements({
				h: { label: 'H', value: value as string, range: { min: 100, max: 600 } }
			})[0].context;
		expect(slider('250').value).toBe(250);
		// A non-numeric string (for instance one carrying CSS) falls back to the minimum.
		expect(slider('50; background:url(x)').value).toBe(100);
	});
});

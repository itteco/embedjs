import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import iframely from '../../src/iframely';
import { boot as bootConst } from '../../src/const';
import { boot as bootEvents } from '../../src/events';
import formBuilder from '../../src/options/form-builder';
import renderer from '../../src/options/renderer';

beforeAll(() => {
	bootConst();
	bootEvents();
	// Provided by import.ts in the embed bundle; stubbed here to unit-test
	// the options subsystem in isolation.
	iframely.addEventListener = (elem, type, handler) => elem.addEventListener(type, handler);
});

let container: HTMLElement;
let changes: { id: string; query: Record<string, unknown> }[];

beforeEach(() => {
	document.body.innerHTML = '<div id="form"></div>';
	container = document.getElementById('form')!;
	changes = [];
});

function buildForm(id = 'test-' + Math.random()): string {
	formBuilder({
		id: id,
		formContainer: container,
		renderer: renderer,
		options: {
			theme: {
				label: 'Theme color',
				value: 'light',
				values: { light: 'Light', dark: 'Dark', auto: 'Auto' }
			},
			_hide: { label: 'Hide artwork', value: false },
			_playlist: { label: 'Include playlist', value: true },
			maxheight: { label: 'Adjust height', value: '' }
		}
	});
	return id;
}

describe('form-builder', () => {
	beforeAll(() => {
		iframely.on(
			'options-changed',
			(id: string, formContainer: HTMLElement, query: Record<string, unknown>) => {
				changes.push({ id, query });
			}
		);
	});

	it('renders all element types into the container', () => {
		buildForm();
		expect(container.querySelectorAll('input[type="radio"]')).toHaveLength(3);
		expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(2);
		expect(container.querySelectorAll('input[type="text"]')).toHaveLength(1);
		expect(container.querySelectorAll('.iframely-option__group').length).toBeGreaterThan(0);
	});

	it('fires options-changed with only non-default values', () => {
		const id = buildForm();

		const hide = container.querySelector<HTMLInputElement>('input[name="_hide"]')!;
		hide.checked = true;
		hide.dispatchEvent(new Event('change', { bubbles: true }));

		expect(changes).toHaveLength(1);
		expect(changes[0].id).toBe(id);
		expect(changes[0].query).toEqual({ _hide: true });
	});

	it('omits values that return to their defaults', () => {
		buildForm();

		const dark = container.querySelector<HTMLInputElement>(
			'input[name="theme"][value="dark"]'
		)!;
		dark.checked = true;
		dark.dispatchEvent(new Event('change', { bubbles: true }));
		expect(changes[0].query).toEqual({ theme: 'dark' });

		const light = container.querySelector<HTMLInputElement>(
			'input[name="theme"][value="light"]'
		)!;
		light.checked = true;
		dark.checked = false;
		light.dispatchEvent(new Event('change', { bubbles: true }));
		expect(changes[1].query).toEqual({});
	});

	it('submits text inputs on Enter', () => {
		buildForm();

		const text = container.querySelector<HTMLInputElement>('input[name="maxheight"]')!;
		text.value = '300';
		text.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

		expect(changes).toHaveLength(1);
		expect(changes[0].query).toEqual({ maxheight: '300' });

		text.value = '400';
		text.dispatchEvent(new FocusEvent('blur'));
		expect(changes[1].query).toEqual({ maxheight: '400' });
	});

	it('clears the container when options are missing', () => {
		container.innerHTML = '<span>old</span>';
		formBuilder({ id: 'x', formContainer: container, renderer: renderer });
		expect(container.innerHTML).toBe('');
	});

	it('warns without a form container', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		formBuilder({ id: 'x', formContainer: null as unknown as HTMLElement, renderer: renderer });
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});
});

describe('form-builder: radio without a selection', () => {
	it('reports other changes when no radio in a group is checked', () => {
		const queries: Record<string, unknown>[] = [];
		iframely.on(
			'options-changed',
			(_id: string, _container: HTMLElement, query: Record<string, unknown>) => {
				queries.push(query);
			}
		);
		formBuilder({
			id: 'radio-none',
			formContainer: container,
			renderer: renderer,
			options: {
				// '' matches none of the values: no radio is checked.
				theme: {
					label: 'Theme color',
					value: '',
					values: { light: 'Light', dark: 'Dark' }
				},
				_hide: { label: 'Hide artwork', value: false }
			}
		});
		expect(container.querySelectorAll('input[type="radio"]:checked')).toHaveLength(0);

		const hide = container.querySelector<HTMLInputElement>('input[name="_hide"]')!;
		hide.checked = true;
		hide.dispatchEvent(new Event('change', { bubbles: true }));

		expect(queries).toEqual([{ _hide: true }]);
	});
});

describe('form-builder: option keys', () => {
	it('binds inputs whose key contains selector metacharacters', () => {
		const queries: Record<string, unknown>[] = [];
		iframely.on(
			'options-changed',
			(_id: string, _container: HTMLElement, query: Record<string, unknown>) => {
				queries.push(query);
			}
		);
		const key = 'a"]b\\c';
		formBuilder({
			id: 'odd-keys',
			formContainer: container,
			renderer: renderer,
			options: { [key]: { label: 'Odd key', value: false } }
		});

		const input = container.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
		expect(input.getAttribute('name')).toBe(key);
		input.checked = true;
		input.dispatchEvent(new Event('change', { bubbles: true }));

		expect(queries).toEqual([{ [key]: true }]);
	});
});

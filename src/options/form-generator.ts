import type { ElementContext, FormElement, TranslatorFn, WidgetOptions } from '../types';

const _RE = /^_./;

const translate = (
	label: string | undefined,
	translator?: TranslatorFn | null
): string | undefined => {
	return translator && typeof translator === 'function' && label
		? translator(label) || label
		: label;
};

export default function getFormElements(
	options: WidgetOptions | undefined,
	translator?: TranslatorFn | null
): FormElement[] {
	if (!options) {
		return [];
	}

	// Remove query key.
	options = Object.assign({}, options);
	delete options.query;

	const items: FormElement[] = [];
	const keys = Object.keys(options);
	let checkboxCount = 0;

	keys.forEach((key) => {
		const context: ElementContext = {};

		let getQuery;
		const option = options[key];
		option.key = key;

		let forceCheckboxForSingleKeyValue = false;
		const valuesKeys: string[] | undefined = option.values
			? Object.keys(option.values)
			: undefined;
		let singleKey: string | undefined, singleLabel: string | undefined;
		if (valuesKeys && valuesKeys.length === 1) {
			forceCheckboxForSingleKeyValue = true;
			singleKey = valuesKeys[0];
			singleLabel = option.values[singleKey];
		}

		context.label = translate(singleLabel || option.label, translator);
		context.key = option.key;

		if (forceCheckboxForSingleKeyValue || typeof option.value === 'boolean') {
			if (forceCheckboxForSingleKeyValue) {
				context.checked = singleKey === option.value || (!singleKey && !option.value);
			} else {
				context.checked = option.value;
			}

			checkboxCount++;

			items.push({
				type: 'checkbox',
				context: context,
				order: _RE.test(key) ? 0 : 1,
				getQuery: (checked: boolean) => {
					let value;
					if (forceCheckboxForSingleKeyValue) {
						value = checked ? singleKey : '';
					} else {
						value = checked;
					}

					const result: Record<string, unknown> = {};

					if (forceCheckboxForSingleKeyValue) {
						if (value === '') {
							// Empty.
						} else {
							result[option.key] = value;
						}
					} else {
						result[option.key] = checked;
					}
					return result;
				}
			});
		} else if (
			(typeof option.value === 'number' || typeof option.value === 'string') &&
			!option.values
		) {
			const useSlider =
				option.range &&
				typeof option.range.min === 'number' &&
				typeof option.range.max === 'number';
			const useNumber = typeof option.value === 'number';

			context.value = option.value;

			getQuery = (inputValue: string | number) => {
				const result: Record<string, unknown> = {};
				if (inputValue === '') {
					// Empty.
				} else {
					result[option.key] = inputValue;
				}
				return result;
			};

			if (useSlider) {
				// The slider interpolates its value into a style attribute, where
				// HTML escaping does not neutralize CSS: only a number may go there.
				const numeric = Number(option.value);
				context.value = Number.isFinite(numeric) ? numeric : option.range.min;
				context.min = option.range.min;
				context.max = option.range.max;
				items.push({
					type: 'range',
					context: context,
					order: 9, // last one
					getQuery: getQuery
				});
			} else {
				context.placeholder = translate(option.placeholder || '', translator);
				context.inputType = useNumber ? 'number' : 'text';
				items.push({
					type: 'text',
					context: context,
					order: /start/i.test(key) ? 7 : 8, // start/end for player timing, ex.: youtube
					getQuery: getQuery
				});
			}
		} else if (option.values) {
			context.value = option.value + '';

			getQuery = (inputValue: string | number) => {
				const result: Record<string, unknown> = {};
				if (inputValue === '') {
					// Empty.
				} else {
					result[option.key] = inputValue;
				}
				return result;
			};

			if (Object.keys(option.values).length <= 3) {
				if (option.label) {
					context.label = translate(option.label, translator);
				} else {
					context.label = false;
				}

				let i = 0;
				let hasLongLabel = false;
				const values = Object.values<string>(option.values);
				while (i < values.length && !hasLongLabel) {
					hasLongLabel = values[i].length > 8;
					i++;
				}
				context.inline = !hasLongLabel;

				context.items = [];

				Object.keys(option.values).forEach((key, idx2) => {
					context.items!.push({
						id: context.key + '-' + idx2,
						value: key,
						label: translate(option.values[key], translator)!,
						checked: context.value === key
					});
				});

				items.push({
					type: 'radio',
					context: context,
					order: hasLongLabel ? -3 : !/theme/.test(key) ? -2 : -1,
					getQuery: getQuery
				});
			} else {
				context.items = [];

				Object.keys(option.values).forEach((key) => {
					context.items!.push({
						value: key,
						label: translate(option.values[key], translator)!,
						checked: context.value === key
					});
				});

				items.push({
					type: 'select',
					context: context,
					order: 5,
					getQuery: getQuery
				});
			}
		}
	});

	items.sort((a, b) => (a.order as number) - (b.order as number));

	items.forEach((item) => {
		delete item.order;
	});

	if (checkboxCount > 0) {
		const groupedItems: FormElement[] = [];
		let subItems: FormElement[] | undefined;

		items.forEach((item, idx) => {
			if (item.type === 'checkbox') {
				// Grouping for checkboxes.

				const newCheckboxGroup =
					checkboxCount > 2 &&
					idx > 0 &&
					!_RE.test(item.context.key!) &&
					items[idx - 1].type === 'checkbox' &&
					_RE.test(items[idx - 1].context.key!);

				if (
					!subItems || // First group.
					newCheckboxGroup // Second group on _ prefix removed.
				) {
					subItems = [];
					groupedItems.push({
						type: 'group',
						context: {
							elements: subItems
						}
					});
				}

				subItems.push(item);
			} else {
				// Other items. Just add.
				groupedItems.push(item);
			}
		});

		return groupedItems;
	} else {
		return items;
	}
}

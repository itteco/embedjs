import getFormElements from './form-generator';
import iframely from '../iframely';
import type { Renderer } from './renderer';
import type { FormElement, TranslatorFn, WidgetOptions } from '../types';

type FormInputs = ArrayLike<HTMLInputElement>;

interface UIElement {
	getValue?: (inputs: FormInputs) => string | number | boolean | undefined;
	customEvents?: (inputs: FormInputs, submitOptionsCb: () => void) => void;
}

const UIelements: Record<string, UIElement> = {
	checkbox: {
		getValue: (inputs) => {
			return inputs[0].checked;
		}
	},
	text: {
		getValue: (inputs) => {
			const input = inputs[0];
			let value: string | number = input.value;
			if (input.type === 'number') {
				value = parseInt(value);
				if (isNaN(value)) {
					value = '';
				}
			}
			return value;
		},
		customEvents: (inputs, submitOptionsCb) => {
			const input = inputs[0];
			iframely.addEventListener(input, 'click', () => {
				input.select();
			});
			iframely.addEventListener(input, 'blur', submitOptionsCb);
			iframely.addEventListener(input, 'keyup', (e: KeyboardEvent) => {
				// Apply on enter.
				if (e.keyCode === 13) {
					submitOptionsCb();
				}
			});
		}
	},
	radio: {
		getValue: (inputs) => {
			let selectedInput: HTMLInputElement | undefined;
			Array.prototype.forEach.call(inputs, (input: HTMLInputElement) => {
				if (input.checked) {
					selectedInput = input;
				}
			});
			// No radio is checked when the option value matches none of the
			// choices; report "no value" rather than throwing.
			return selectedInput ? selectedInput.value : undefined;
		}
	}
};

const defaultQueryById: Record<string, Record<string, unknown>> = {};

export interface FormBuilderParams {
	id: string;
	formContainer: HTMLElement;
	options?: WidgetOptions;
	renderer: Renderer;
	translator?: TranslatorFn | null;
}

export default function formBuilder(params: FormBuilderParams): void {
	const options = params.options;
	const formContainer = params.formContainer;

	if (!formContainer) {
		console.warn('No formContainer in form-builder options', params);
		return;
	}

	if (!options) {
		formContainer.innerHTML = '';
		return;
	}

	const elements = getFormElements(options, params.translator);
	const id = params.id;
	const renderer = params.renderer;

	const defaultQuery = (defaultQueryById[id] = defaultQueryById[id] || {});
	// Exclude default values.
	Object.keys(options).forEach((key) => {
		if (!options.query || options.query.indexOf(key) === -1) {
			// Store default value.
			defaultQuery[key] = options[key].value;
		}
	});

	function getQueryFromForm(): Record<string, unknown> {
		const query: Record<string, unknown> = {};

		const getOptionsFromElements = (elements: FormElement[]) => {
			// Get options from all inputs.
			elements.forEach((element) => {
				if (element.context && element.context.elements) {
					getOptionsFromElements(element.context.elements);
				} else if (element.inputs) {
					const elementUI = UIelements[element.type];
					let inputValue;
					if (elementUI && elementUI.getValue) {
						inputValue = elementUI.getValue(element.inputs as FormInputs);
					} else {
						inputValue = element.inputs[0].value;
					}
					Object.assign(query, element.getQuery!(inputValue));
				}
			});
		};

		getOptionsFromElements(elements);

		return query;
	}

	function getAndSubmitOptions(): void {
		const query = getQueryFromForm();

		Object.keys(defaultQuery).forEach((key) => {
			if (defaultQuery[key] === query[key] || query[key] === undefined) {
				// remove undefined so it's not included while JSON.stringify
				delete query[key];
			}
		});

		iframely.trigger('options-changed', id, formContainer, query);
	}

	// Render form.
	const renderElements = (elements: FormElement[]): string => {
		let html = '';
		elements.forEach((element) => {
			if (element.context && element.context.elements) {
				element.context.elementsHtml = renderElements(element.context.elements);
			}
			html += renderer(element.type, element.context || {});
		});
		return html;
	};
	formContainer.innerHTML = renderElements(elements);

	// Bind events.
	const bindElements = (elements: FormElement[]): void => {
		elements.forEach((element) => {
			if (element.context && element.context.elements) {
				bindElements(element.context.elements);
			} else {
				const elementUI = UIelements[element.type];
				if (element.context) {
					// Keys come from the API response; escape them for the selector.
					const inputs = formContainer.querySelectorAll<HTMLInputElement>(
						'[name="' + String(element.context.key).replace(/["\\]/g, '\\$&') + '"]'
					);
					element.inputs = inputs;
					if (inputs.length > 0) {
						if (elementUI && elementUI.customEvents) {
							elementUI.customEvents(inputs, getAndSubmitOptions);
						} else {
							inputs.forEach((input) => {
								iframely.addEventListener(input, 'change', getAndSubmitOptions);
							});
						}
					} else {
						console.warn('No inputs found for option', element.context.key);
					}
				}
			}
		});
	};
	bindElements(elements);
}

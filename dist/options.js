(function() {


//#region src/iframely.ts
	function createServerStub() {
		const noop = () => {};
		return {
			config: {},
			on: noop,
			trigger: noop,
			triggerAsync: noop,
			load: noop,
			configure: noop,
			extendOptions: noop,
			setTheme: noop,
			cancelWidget: noop,
			openHref: noop,
			addEventListener: noop,
			isTouch: () => false,
			findIframe: () => void 0,
			getElementComputedStyle: () => void 0,
			buildOptionsForm: noop
		};
	}
	var iframely = typeof window === "undefined" ? createServerStub() : window.iframely = window.iframely || {};
	iframely.config = iframely.config || {};

//#endregion
//#region src/options/form-generator.ts
	var _RE = /^_./;
	var translate = (label, translator) => {
		return translator && typeof translator === "function" && label ? translator(label) || label : label;
	};
	function getFormElements(options, translator) {
		if (!options) return [];
		options = Object.assign({}, options);
		delete options.query;
		const items = [];
		const keys = Object.keys(options);
		let checkboxCount = 0;
		keys.forEach((key) => {
			const context = {};
			let getQuery;
			const option = options[key];
			option.key = key;
			let forceCheckboxForSingleKeyValue = false;
			const valuesKeys = option.values ? Object.keys(option.values) : void 0;
			let singleKey, singleLabel;
			if (valuesKeys && valuesKeys.length === 1) {
				forceCheckboxForSingleKeyValue = true;
				singleKey = valuesKeys[0];
				singleLabel = option.values[singleKey];
			}
			context.label = translate(singleLabel || option.label, translator);
			context.key = option.key;
			if (forceCheckboxForSingleKeyValue || typeof option.value === "boolean") {
				if (forceCheckboxForSingleKeyValue) context.checked = singleKey === option.value || !singleKey && !option.value;
				else context.checked = option.value;
				checkboxCount++;
				items.push({
					type: "checkbox",
					context,
					order: _RE.test(key) ? 0 : 1,
					getQuery: (checked) => {
						let value;
						if (forceCheckboxForSingleKeyValue) value = checked ? singleKey : "";
						else value = checked;
						const result = {};
						if (forceCheckboxForSingleKeyValue) if (value === "") {} else result[option.key] = value;
						else result[option.key] = checked;
						return result;
					}
				});
			} else if ((typeof option.value === "number" || typeof option.value === "string") && !option.values) {
				const useSlider = option.range && typeof option.range.min === "number" && typeof option.range.max === "number";
				const useNumber = typeof option.value === "number";
				context.value = option.value;
				getQuery = (inputValue) => {
					const result = {};
					if (inputValue === "") {} else result[option.key] = inputValue;
					return result;
				};
				if (useSlider) {
					context.min = option.range.min;
					context.max = option.range.max;
					items.push({
						type: "range",
						context,
						order: 9,
						getQuery
					});
				} else {
					context.placeholder = translate(option.placeholder || "", translator);
					context.inputType = useNumber ? "number" : "text";
					items.push({
						type: "text",
						context,
						order: /start/i.test(key) ? 7 : 8,
						getQuery
					});
				}
			} else if (option.values) {
				context.value = option.value + "";
				getQuery = (inputValue) => {
					const result = {};
					if (inputValue === "") {} else result[option.key] = inputValue;
					return result;
				};
				if (Object.keys(option.values).length <= 3) {
					if (option.label) context.label = translate(option.label, translator);
					else context.label = false;
					let i = 0;
					let hasLongLabel = false;
					const values = Object.values(option.values);
					while (i < values.length && !hasLongLabel) {
						hasLongLabel = values[i].length > 8;
						i++;
					}
					context.inline = !hasLongLabel;
					context.items = [];
					Object.keys(option.values).forEach((key, idx2) => {
						context.items.push({
							id: context.key + "-" + idx2,
							value: key,
							label: translate(option.values[key], translator),
							checked: context.value === key
						});
					});
					items.push({
						type: "radio",
						context,
						order: hasLongLabel ? -3 : !/theme/.test(key) ? -2 : -1,
						getQuery
					});
				} else {
					context.items = [];
					Object.keys(option.values).forEach((key) => {
						context.items.push({
							value: key,
							label: translate(option.values[key], translator),
							checked: context.value === key
						});
					});
					items.push({
						type: "select",
						context,
						order: 5,
						getQuery
					});
				}
			}
		});
		items.sort((a, b) => a.order - b.order);
		items.forEach((item) => {
			delete item.order;
		});
		if (checkboxCount > 0) {
			const groupedItems = [];
			let subItems;
			items.forEach((item, idx) => {
				if (item.type === "checkbox") {
					const newCheckboxGroup = checkboxCount > 2 && idx > 0 && !_RE.test(item.context.key) && items[idx - 1].type === "checkbox" && _RE.test(items[idx - 1].context.key);
					if (!subItems || newCheckboxGroup) {
						subItems = [];
						groupedItems.push({
							type: "group",
							context: { elements: subItems }
						});
					}
					subItems.push(item);
				} else groupedItems.push(item);
			});
			return groupedItems;
		} else return items;
	}

//#endregion
//#region src/options/form-builder.ts
	var UIelements = {
		checkbox: { getValue: (inputs) => {
			return inputs[0].checked;
		} },
		text: {
			getValue: (inputs) => {
				const input = inputs[0];
				let value = input.value;
				if (input.type === "number") {
					value = parseInt(value);
					if (isNaN(value)) value = "";
				}
				return value;
			},
			customEvents: (inputs, submitOptionsCb) => {
				const input = inputs[0];
				iframely.addEventListener(input, "click", () => {
					input.select();
				});
				iframely.addEventListener(input, "blur", submitOptionsCb);
				iframely.addEventListener(input, "keyup", (e) => {
					if (e.keyCode === 13) submitOptionsCb();
				});
			}
		},
		radio: { getValue: (inputs) => {
			let selectedInput;
			Array.prototype.forEach.call(inputs, (input) => {
				if (input.checked) selectedInput = input;
			});
			return selectedInput.value;
		} }
	};
	var defaultQueryById = {};
	function formBuilder(params) {
		const options = params.options;
		const formContainer = params.formContainer;
		if (!formContainer) {
			console.warn("No formContainer in form-builder options", params);
			return;
		}
		if (!options) {
			formContainer.innerHTML = "";
			return;
		}
		const elements = getFormElements(options, params.translator);
		const id = params.id;
		const renderer = params.renderer;
		const defaultQuery = defaultQueryById[id] = defaultQueryById[id] || {};
		Object.keys(options).forEach((key) => {
			if (!options.query || options.query.indexOf(key) === -1) defaultQuery[key] = options[key].value;
		});
		function getQueryFromForm() {
			const query = {};
			const getOptionsFromElements = (elements) => {
				elements.forEach((element) => {
					if (element.context && element.context.elements) getOptionsFromElements(element.context.elements);
					else if (element.inputs) {
						const elementUI = UIelements[element.type];
						let inputValue;
						if (elementUI && elementUI.getValue) inputValue = elementUI.getValue(element.inputs);
						else inputValue = element.inputs[0].value;
						Object.assign(query, element.getQuery(inputValue));
					}
				});
			};
			getOptionsFromElements(elements);
			return query;
		}
		function getAndSubmitOptions() {
			const query = getQueryFromForm();
			Object.keys(defaultQuery).forEach((key) => {
				if (defaultQuery[key] === query[key] || query[key] === void 0) delete query[key];
			});
			iframely.trigger("options-changed", id, formContainer, query);
		}
		const renderElements = (elements) => {
			let html = "";
			elements.forEach((element) => {
				if (element.context && element.context.elements) element.context.elementsHtml = renderElements(element.context.elements);
				html += renderer(element.type, element.context || {});
			});
			return html;
		};
		formContainer.innerHTML = renderElements(elements);
		const bindElements = (elements) => {
			elements.forEach((element) => {
				if (element.context && element.context.elements) bindElements(element.context.elements);
				else {
					const elementUI = UIelements[element.type];
					if (element.context) {
						const inputs = formContainer.querySelectorAll("[name=\"" + element.context.key + "\"]");
						element.inputs = inputs;
						if (inputs.length > 0) if (elementUI && elementUI.customEvents) elementUI.customEvents(inputs, getAndSubmitOptions);
						else inputs.forEach((input) => {
							iframely.addEventListener(input, "change", getAndSubmitOptions);
						});
						else console.warn("No inputs found for option", element.context.key);
					}
				}
			});
		};
		bindElements(elements);
	}

//#endregion
//#region src/options/renderer.ts
	var ESCAPE_MAP = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#39;"
	};
	var esc = (value) => value == null ? "" : String(value).replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);
	var templates = {
		checkbox: (ctx) => `
        <div class="iframely-option-check iframely-option-checkbox">
            <input type="checkbox" class="iframely-option-check__input" id="${esc(ctx.key)}" name="${esc(ctx.key)}"${ctx.checked ? " checked=\"checked\"" : ""}>
            <label class="iframely-option-check__label" for="${esc(ctx.key)}">${esc(ctx.label)}</label>
        </div>`,
		group: (ctx) => `
        <div class="iframely-option">
            <div class="iframely-option__group">${ctx.elementsHtml ?? ""}</div>
        </div>`,
		radio: (ctx) => `
        <div class="iframely-option">
            ${ctx.label ? `<label class="iframely-option__label">${esc(ctx.label)}:</label>` : ""}
            <div class="iframely-option__group${ctx.inline ? " iframely-option__group-inline" : ""}">
                ${(ctx.items || []).map((item) => `
                <div class="iframely-option-check iframely-option-radio">
                    <input type="radio" class="iframely-option-check__input" id="${esc(item.id)}" name="${esc(ctx.key)}" value="${esc(item.value)}"${item.checked ? " checked=\"checked\"" : ""}>
                    <label class="iframely-option-check__label" for="${esc(item.id)}">${esc(item.label)}</label>
                </div>`).join("")}
            </div>
        </div>`,
		range: (ctx) => `
        <div class="iframely-option">
            <label class="iframely-option__label" for="${esc(ctx.key)}">${esc(ctx.label)}:</label>
            <div class="iframely-option__group">
                <input type="range" class="iframely-option__range" id="${esc(ctx.key)}" name="${esc(ctx.key)}" min="${esc(ctx.min)}" max="${esc(ctx.max)}" step="1" value="${esc(ctx.value)}" style="--min: ${esc(ctx.min)}; --max: ${esc(ctx.max)}; --val: ${esc(ctx.value)};">
            </div>
        </div>`,
		select: (ctx) => `
        <div class="iframely-option">
            <label class="iframely-option__label" for="${esc(ctx.key)}">${esc(ctx.label)}:</label>
            <div class="iframely-option__group">
                <select class="iframely-option__input iframely-option__select" id="${esc(ctx.key)}" name="${esc(ctx.key)}">
                    ${(ctx.items || []).map((item) => `<option value="${esc(item.value)}"${item.checked ? " selected" : ""}>${esc(item.label)}</option>`).join("")}
                </select>
            </div>
        </div>`,
		text: (ctx) => `
        <div class="iframely-option">
            <label class="iframely-option__label" for="${esc(ctx.key)}">${esc(ctx.label)}:</label>
            <div class="iframely-option__group">
                <input type="${esc(ctx.inputType)}" class="iframely-option__input iframely-option__text" id="${esc(ctx.key)}" name="${esc(ctx.key)}" placeholder="${esc(ctx.placeholder)}" value="${esc(ctx.value)}">
            </div>
        </div>`
	};
	var render = (type, context) => templates[type](context);

//#endregion
//#region src/options/index.ts
	function boot() {
		iframely.buildOptionsForm = (id, formContainer, options, translator) => {
			formBuilder({
				id,
				formContainer,
				options,
				renderer: render,
				translator
			});
		};
	}

//#endregion
//#region src/options/entry.ts
	boot();

//#endregion
})();
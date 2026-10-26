import { t as iframely } from "./iframely.js";
//#region src/options/translator.ts
var langs = {};
var optionsTranslator = (lang) => {
	return (label) => {
		return langs[lang] && langs[lang][label] && langs[lang][label] !== "" ? langs[lang][label] : label;
	};
};
function registerLabels(lang, labels) {
	const existingLabels = langs[lang] = langs[lang] || {};
	Object.assign(existingLabels, labels);
	if (typeof window !== "undefined") iframely.optionsTranslator = optionsTranslator;
}
//#endregion
export { registerLabels as t };

//# sourceMappingURL=translator.js.map
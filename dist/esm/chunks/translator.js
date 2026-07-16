import { t as iframely } from "./iframely.js";
//#region src/options/translator.ts
var langs = {};
function registerLabels(lang, labels) {
	const existingLabels = langs[lang] = langs[lang] || {};
	Object.assign(existingLabels, labels);
}
iframely.optionsTranslator = (lang) => {
	return (label) => {
		return langs[lang] && langs[lang][label] && langs[lang][label] !== "" ? langs[lang][label] : label;
	};
};
//#endregion
export { registerLabels as t };

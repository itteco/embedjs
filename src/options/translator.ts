/*
To add more languages to the translator -
see ./lang/labels.LAN.example.ts

 - use the template for the list of currently available labels
 - save it as labels.LAN.ts  // replace LAN with your actual value, e.g. es, de, ru, etc.
 - fill in the labels translations
 - add it to the `iifeEntries` list in scripts/build.js as
    ['src/options/lang/labels.LAN.ts', 'options.i18n.LAN']

You can then call iframely.optionsTranslator('LAN') - with your chosen language - to build the options form

You don't need to translate all the labels. The ones without a translation will be left as-is
*/

import iframely from '../iframely.js';

const langs: Record<string, Record<string, string>> = {};

const optionsTranslator = (lang: string) => {
	return (label: string) => {
		return langs[lang] && langs[lang][label] && langs[lang][label] !== ''
			? langs[lang][label]
			: label;
	};
};

// Every i18n bundle calls this at load, and i18n bundles carry their own
// copy of this module: installing optionsTranslator here means the
// last-loaded copy, holding its own registered labels, wins. This mirrors
// the original cross-bundle behavior. Skipped on the server, where the
// singleton is a shared stub (see server-stub.ts).
export function registerLabels(lang: string, labels: Record<string, string>): void {
	const existingLabels = (langs[lang] = langs[lang] || {});
	Object.assign(existingLabels, labels);
	if (typeof window !== 'undefined') {
		iframely.optionsTranslator = optionsTranslator;
	}
}

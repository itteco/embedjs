import iframely from '../iframely.js';
import formBuilder from './form-builder.js';
import renderer from './renderer.js';

export function boot(): void {
	iframely.buildOptionsForm = (id, formContainer, options, translator) => {
		// The standalone options.js bundle relies on an embed bundle for the
		// event bus and addEventListener. Checked per call (not at boot)
		// because loading options.js before embed.js is a supported order.
		// Without embed.js the form fails silently instead of throwing.
		if (
			typeof iframely.trigger !== 'function' ||
			typeof iframely.addEventListener !== 'function'
		) {
			console.warn(
				'iframely.buildOptionsForm requires embed.js (or embed-options.js) to be loaded'
			);
			return;
		}

		formBuilder({
			id: id,
			formContainer: formContainer,
			options: options,
			renderer: renderer,
			translator: translator
		});
	};
}

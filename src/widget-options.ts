import iframely from './iframely.js';

export function boot(): void {
	iframely.on('message', (widget, message) => {
		if (message.method === 'setIframelyEmbedOptions') {
			iframely.trigger('options', widget, message.data);
		}
	});
}

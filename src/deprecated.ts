import iframely from './iframely.js';

// The pre-2.0 names kept for existing integrations. Two more live elsewhere:
// - the heightChanged event, in widget-resize.ts: it is queued right after
//   height-changed, an order a listener registered here could not keep;
// - iframely.VERSION, in constants.ts: the server stub reads it too, and
//   nothing here boots on a server.
export function boot(): void {
	// deprecated. Helper function only, for the reverse compatibility.
	iframely.widgets = iframely.widgets || {};
	iframely.widgets.load = iframely.load;

	// Pre-2.0 name of iframely.configure.
	iframely.extendOptions = iframely.configure;

	if (!iframely.events) {
		iframely.events = {};
		iframely.events.on = iframely.on;
		iframely.events.trigger = iframely.trigger;
	}

	iframely.on(
		'cancel',
		(url: string, parentNode: Node | null, text: string | null, nextSibling: Node | null) => {
			if (iframely.RECOVER_HREFS_ON_CANCEL && !text) {
				text = url;
			}

			if (url && parentNode && text && text !== '') {
				const a = document.createElement('a');
				a.setAttribute('href', url);
				a.setAttribute('target', '_blank');
				a.setAttribute('rel', 'noopener');
				a.textContent = text;
				if (nextSibling) {
					parentNode.insertBefore(a, nextSibling);
				} else {
					parentNode.appendChild(a);
				}
			}
		}
	);
}

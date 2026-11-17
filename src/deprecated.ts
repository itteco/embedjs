import iframely from './iframely.js';

// The pre-2.0 names kept for existing integrations. Two more live elsewhere:
// - the heightChanged event, in widget-resize.ts: it is queued right after
//   height-changed, an order a listener registered here could not keep;
// - iframely.VERSION, in constants.ts: the server stub reads it too, and
//   nothing here boots on a server.
export function boot(): void {
	// Pre-2.0 namespace of iframely.load.
	iframely.widgets = iframely.widgets || {};
	iframely.widgets.load = iframely.load;

	// Pre-2.0 name of iframely.configure.
	iframely.extendOptions = iframely.configure;

	// Pre-2.0 namespace of iframely.on and iframely.trigger.
	if (!iframely.events) {
		iframely.events = {};
		iframely.events.on = iframely.on;
		iframely.events.trigger = iframely.trigger;
	}
}

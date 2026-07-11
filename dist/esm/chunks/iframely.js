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
export { iframely as t };

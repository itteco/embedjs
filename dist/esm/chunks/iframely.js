//#region src/iframely.ts
var iframely = typeof window === "undefined" ? {} : window.iframely = window.iframely || {};
iframely.config = iframely.config || {};
//#endregion
export { iframely as t };

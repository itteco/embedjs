import { t as iframely } from "./chunks/iframely.js";
import { n as bootCore, t as applyServerStub } from "./chunks/server-stub.js";
//#region src/index.ts
bootCore();
//#endregion
//#region src/main.ts
if (typeof window === "undefined") applyServerStub();
else iframely.config.autorun = iframely.config.autorun ?? false;
//#endregion
export { iframely };

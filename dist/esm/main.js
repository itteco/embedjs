import { t as iframely } from "./chunks/iframely.js";
import { t as bootCore } from "./chunks/boot-core.js";
//#region src/index.ts
bootCore();
//#endregion
//#region src/main.ts
if (typeof window !== "undefined") iframely.config.autorun = iframely.config.autorun ?? false;
//#endregion
export { iframely };

import { t as iframely } from "./chunks/iframely.js";
import { a as boot$10, c as boot$7, d as boot$4, f as boot$2, h as boot, i as boot$11, l as boot$6, m as boot$1, n as boot$13, o as boot$9, p as boot$3, r as boot$12, s as boot$8, t as boot$14, u as boot$5 } from "./chunks/deprecated.js";
//#region src/index.ts
if (typeof window !== "undefined" && !iframely._loaded) {
	iframely._loaded = true;
	boot();
	boot$1();
	boot$2();
	boot$3();
	boot$4();
	boot$5();
	boot$6();
	boot$7();
	boot$8();
	boot$9();
	boot$10();
	boot$11();
	boot$12();
	boot$13();
	boot$14();
	iframely.trigger("init");
}
//#endregion
//#region src/main.ts
if (typeof window !== "undefined") iframely.config.autorun = iframely.config.autorun ?? false;
//#endregion
export { iframely };

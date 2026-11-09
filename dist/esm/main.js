/*! @iframely/embed.js 2.0.0-next.3 | MIT | https://github.com/itteco/embedjs */
import { n as bootCore, r as setAutorunDefault, t as applyServerStub } from "./chunks/core.js";
export { t as iframely } from "./chunks/iframely.js";
// src/index.ts
bootCore();
// src/main.ts
if (typeof window === "undefined") applyServerStub();
else setAutorunDefault(false);

//# sourceMappingURL=main.js.map
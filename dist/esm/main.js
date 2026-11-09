/*! @iframely/embed.js 2.0.0-next.2 | MIT | https://github.com/itteco/embedjs */
import { n as bootCore, t as applyServerStub } from "./chunks/core.js";
import { t as iframely } from "./chunks/iframely.js";
// src/index.ts
bootCore();
// src/main.ts
if (typeof window === "undefined") applyServerStub();
else iframely.config.autorun = iframely.config.autorun ?? false;
export { iframely };

//# sourceMappingURL=main.js.map
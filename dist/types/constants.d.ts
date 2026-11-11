import type { Iframely } from './types.js';
export type IframelyConstants = Pick<Iframely, 'API_VERSION' | 'VERSION' | 'LIB_VERSION' | 'ASPECT_WRAPPER_CLASS' | 'MAXWIDTH_WRAPPER_CLASS' | 'LOADER_CLASS' | 'DOMAINS' | 'CDN' | 'BASE_RE' | 'ID_RE' | 'SCRIPT_RE' | 'CDN_RE' | 'SUPPORTED_QUERY_STRING' | 'SUPPORTED_THEMES' | 'LAZY_IFRAME_SHOW_TIMEOUT' | 'LAZY_IFRAME_FADE_TIMEOUT' | 'CLEAR_WRAPPER_STYLES_TIMEOUT' | 'RECOVER_HREFS_ON_CANCEL' | 'SHADOW' | 'SUPPORT_IFRAME_LOADING_ATTR'>;
export declare const LIB_VERSION: string;
export declare const CORE_API: readonly ['addEventListener', 'buildImportWidgets', 'cancelWidget', 'configure', 'extendOptions', 'findIframe', 'getElementComputedStyle', 'isTouch', 'load', 'off', 'on', 'openHref', 'setTheme', 'trigger', 'triggerAsync', 'unload'];
export declare function createConstants(): IframelyConstants;
//# sourceMappingURL=constants.d.ts.map
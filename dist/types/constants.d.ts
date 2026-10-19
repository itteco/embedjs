import type { Iframely } from './types';
export type IframelyConstants = Pick<Iframely, 'VERSION' | 'ASPECT_WRAPPER_CLASS' | 'MAXWIDTH_WRAPPER_CLASS' | 'LOADER_CLASS' | 'DOMAINS' | 'CDN' | 'BASE_RE' | 'ID_RE' | 'SCRIPT_RE' | 'CDN_RE' | 'SUPPORTED_QUERY_STRING' | 'SUPPORTED_THEMES' | 'LAZY_IFRAME_SHOW_TIMEOUT' | 'LAZY_IFRAME_FADE_TIMEOUT' | 'CLEAR_WRAPPER_STYLES_TIMEOUT' | 'RECOVER_HREFS_ON_CANCEL' | 'SHADOW' | 'SUPPORT_IFRAME_LOADING_ATTR'>;
export declare function createConstants(): IframelyConstants;

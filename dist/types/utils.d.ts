import type { IframelyWidget } from './types.js';
export declare function boot(): void;
export declare function getIframeWrapper(iframe: Element, checkClass?: boolean): {
    aspectWrapper: HTMLElement;
    maxWidthWrapper: HTMLElement;
} | undefined;
export declare function addDefaultWrappers(el: Element): {
    aspectWrapper: HTMLElement;
    maxWidthWrapper: HTMLElement;
};
export declare function getWidget(iframe: Element): IframelyWidget | undefined;
export declare function setStyles(el: HTMLElement | undefined | null, styles: Record<string, string | number | undefined>): void;
export declare function applyNonce(element: HTMLElement): void;
export declare function addQueryString(href: string, options: Record<string, any>): string;
export declare function getEndpoint(src: string, options?: Record<string, any>, config_params?: (string | RegExp)[]): string;
export declare function findParentByClass(el: Element, className: string): Element | false;
export declare function nonTextChildCount(element: Element): number;
export declare function parseQueryString(url: string, allowed_query_string?: (string | RegExp)[]): Record<string, string>;
export declare function createScript(): HTMLScriptElement;

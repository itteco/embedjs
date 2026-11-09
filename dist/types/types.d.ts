export type ConfigValue = string | number | boolean;
export interface IframelyConfig {
    /** Your Iframely API key (or `key`, its hashed form). */
    api_key?: string;
    key?: string;
    /** `'auto'`, `'light'` or `'dark'`. */
    theme?: string;
    /**
     * Scan the page on `DOMContentLoaded`. When not set, the script tag does and the npm module does not;
     * a value set here applies to both.
     */
    autorun?: boolean;
    /**
     * Host your iframes are served from, when you use your own CDN. configure() moves it to
     * {@link Iframely.CDN}; it is not kept in config.
     */
    cdn?: string | false;
    nonce?: string;
    shadow?: string;
    lazy?: ConfigValue;
    maxwidth?: ConfigValue;
    maxheight?: ConfigValue;
    align?: string;
    language?: string;
    import?: ConfigValue;
    parent?: string;
    [key: string]: ConfigValue | undefined;
}
export interface IframelyWidget {
    iframe: Element;
    aspectWrapper: HTMLElement;
    maxWidthWrapper: HTMLElement;
    url?: string;
}
export interface IframelyMessage {
    method?: string;
    type?: string;
    context?: string;
    src?: string;
    url?: string;
    height?: number;
    domains?: string | string[];
    [key: string]: any;
}
export interface FindIframeOptions {
    contentWindow: MessageEventSource | Window | null;
    src?: string;
    domains?: string[] | false;
}
export type TranslatorFn = (label: string) => string;
export type FormElementType = 'checkbox' | 'range' | 'text' | 'radio' | 'select' | 'group';
export interface RadioItem {
    id?: string;
    value: string | number | boolean;
    label: string;
    checked?: boolean;
}
export interface ElementContext {
    key?: string;
    id?: string;
    label?: string | false;
    checked?: boolean;
    value?: string | number | boolean;
    min?: number;
    max?: number;
    placeholder?: string;
    inputType?: string;
    inline?: boolean;
    items?: RadioItem[];
    elements?: FormElement[];
    elementsHtml?: string;
    [key: string]: any;
}
export interface FormElement {
    type: FormElementType;
    context: ElementContext;
    order?: number;
    getQuery?: (inputValue: any) => Record<string, unknown>;
    inputs?: ArrayLike<HTMLInputElement | HTMLSelectElement>;
    [key: string]: any;
}
export interface WidgetOption {
    label?: string;
    value?: ConfigValue;
    values?: Record<string, string>;
    placeholder?: string;
    range?: {
        min: number;
        max: number;
    };
    [key: string]: any;
}
export type WidgetOptions = Record<string, any>;
/**
 * Arguments of the library events, by event name, as passed to `iframely.on`
 * callbacks. Events marked internal serve the library's own modules and may
 * change without notice. Any other name is a custom event with untyped
 * arguments, so a misspelled name still compiles; only the payloads of the
 * names listed here are checked.
 */
export interface IframelyEvents {
    /** @internal Boot finished. Handlers run once and are then dropped. */
    init: [];
    /** load() was called: the document (no target), a container, an anchor or lazy iframe, or (container, url). */
    load: [target?: Element | DocumentFragment, url?: string];
    /** unload() finished, for the whole document or one container. */
    unload: [container?: Element];
    /** A widget is being removed by unload() or cancelWidget(); release what you keep for it. */
    'unload-widget': [widget: IframelyWidget];
    /** An embed iframe has been created or revealed. */
    'iframe-ready': [iframe: HTMLIFrameElement];
    /** @internal A message from an embed iframe; `widget` is undefined without the wrapper structure. */
    message: [widget: IframelyWidget | undefined, message: IframelyMessage];
    /** An embed reported its URL options (for buildOptionsForm). */
    options: [widget: IframelyWidget | undefined, options: WidgetOptions];
    /** The user changed a value in an options form. */
    'options-changed': [id: string, container: HTMLElement, query: Record<string, any>];
    /** setTheme() applied a theme to the whole page. */
    'set-theme': [theme: string];
    /** A widget was cancelled (no embed for the URL). */
    cancel: [url: string, parentNode: Node | null, text: string | null, nextSibling: Node | null];
    /** An embed asked to open a link. */
    click: [href: string];
    'open-href': [href: string];
    /** An embed iframe changed its height (CSS values, e.g. `'300px'`). */
    heightChanged: [iframe: Element, oldHeight: string, newHeight: string];
    /** @internal */
    'import-loaded': [importOptions: Record<string, any>];
    /** @internal */
    'import-widget-ready': [el: Element];
    /** @internal */
    'import-shadow-widget-before-render': [options: Record<string, any>];
    /** @internal */
    'import-shadow-widget-after-render': [options: Record<string, any>];
}
export type IframelyEventName = keyof IframelyEvents;
type CustomEventName<E extends string> = E extends IframelyEventName ? never : E;
export interface Iframely {
    config: IframelyConfig;
    _loaded?: boolean;
    /** Subscribe to a library event (see {@link IframelyEvents}) or a custom one. */
    on<E extends IframelyEventName>(event: E, cb: (...args: IframelyEvents[E]) => void): void;
    on<E extends string>(event: CustomEventName<E>, cb: (...args: any[]) => void): void;
    trigger<E extends IframelyEventName>(event: E, ...args: IframelyEvents[E]): void;
    trigger<E extends string>(event: CustomEventName<E>, ...args: any[]): void;
    triggerAsync<E extends IframelyEventName>(event: E, ...args: IframelyEvents[E]): void;
    triggerAsync<E extends string>(event: CustomEventName<E>, ...args: any[]): void;
    /** Build the embeds in the whole document. */
    load(): void;
    /**
     * Build the embeds inside a container (an element, fragment or shadow root),
     * or unfurl one `<a data-iframely-url>` or lazy `<iframe data-iframely-url>`.
     */
    load(target: Element | DocumentFragment): void;
    /** Append a link to `url` to the container and unfurl it. */
    load(container: Element, url: string): void;
    /**
     * Inverse of load(): removes built widgets from the document (or a
     * container), releases their intersection observers and pending timers.
     * Import/shadow widgets are not covered; consumed anchors are not restored.
     */
    unload(el?: Element): void;
    configure(options: IframelyConfig | undefined): void;
    /** @deprecated Pre-2.0 name of {@link Iframely.configure}. */
    extendOptions(options: IframelyConfig | undefined): void;
    getElementComputedStyle(el: Element, style: string): string | undefined;
    findIframe(options: FindIframeOptions): HTMLIFrameElement | undefined;
    setTheme(theme?: string, container?: Element): void;
    addEventListener(elem: EventTarget, type: string, handler: (e: any) => void): void;
    isTouch(): boolean;
    buildOptionsForm?(id: string, formContainer: HTMLElement, options: WidgetOptions, translator?: TranslatorFn | null): void;
    optionsTranslator?(lang: string): TranslatorFn | undefined;
    /**
     * API protocol version, sent to Iframely as the `v=` parameter. Not the
     * library version: see {@link Iframely.LIB_VERSION}.
     */
    API_VERSION: number;
    /** @deprecated Pre-2.0 name of {@link Iframely.API_VERSION}; the library no longer reads it. */
    VERSION: number;
    /** The embed.js release that booted this page, e.g. `'2.0.0'`. Absent in 1.x and 2.0.0-next.1. */
    LIB_VERSION: string;
    ASPECT_WRAPPER_CLASS: string;
    MAXWIDTH_WRAPPER_CLASS: string;
    LOADER_CLASS: string;
    DOMAINS: string[];
    CDN: string;
    BASE_RE: RegExp;
    ID_RE: RegExp;
    SCRIPT_RE: RegExp;
    CDN_RE: RegExp;
    SUPPORTED_QUERY_STRING: (string | RegExp)[];
    SUPPORTED_THEMES: string[];
    LAZY_IFRAME_SHOW_TIMEOUT: number;
    LAZY_IFRAME_FADE_TIMEOUT: number;
    CLEAR_WRAPPER_STYLES_TIMEOUT: number;
    RECOVER_HREFS_ON_CANCEL: boolean;
    SHADOW: string;
    SUPPORT_IFRAME_LOADING_ATTR: boolean;
    widgets: {
        load?: Iframely['load'];
    };
    events: {
        on?: Iframely['on'];
        trigger?: Iframely['trigger'];
    };
    [key: string]: any;
}
declare global {
    interface Window {
        iframely?: Iframely;
    }
}
export {};
//# sourceMappingURL=types.d.ts.map
export type ConfigValue = string | number | boolean;

export interface IframelyConfig {
    autorun?: boolean;
    theme?: string;
    nonce?: string;
    cdn?: string;
    shadow?: string;
    lazy?: ConfigValue;
    key?: string;
    api_key?: string;
    [key: string]: ConfigValue | undefined;
}

export interface IframelyWidget {
    // Can actually be an <a> before unfurling, hence Element.
    iframe: Element;
    aspectWrapper: HTMLElement;
    maxWidthWrapper: HTMLElement;
    url?: string;
}

// Cross-window payloads are dynamic by nature; typed pragmatically.
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
    range?: { min: number; max: number };
    [key: string]: any;
}

export type WidgetOptions = Record<string, any>;

export interface Iframely {
    config: IframelyConfig;
    _loaded?: boolean;

    // events.ts
    on(event: string, cb: (...args: any[]) => void): void;
    trigger(event: string, ...args: any[]): void;
    triggerAsync(event: string, ...args: any[]): void;

    // utils.ts
    load(...args: any[]): void;
    extendOptions(options: Record<string, any> | undefined): void;
    getElementComputedStyle(el: Element, style: string): string | undefined;

    // messaging.ts
    findIframe(options: FindIframeOptions): HTMLIFrameElement | undefined;

    // theme.ts
    setTheme(theme?: string): void;

    // import.ts
    addEventListener(elem: EventTarget, type: string, handler: (e: any) => void): void;
    isTouch(): boolean;

    // options subsystem (only present when an options bundle is loaded)
    buildOptionsForm?(id: string, formContainer: HTMLElement, options: WidgetOptions, translator?: TranslatorFn | null): void;
    optionsTranslator?(lang: string): TranslatorFn | undefined;

    // const.ts
    VERSION: number;
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

    // deprecated.ts shims
    widgets: { load?: Iframely['load'] };
    events: { on?: Iframely['on']; trigger?: Iframely['trigger'] };

    // The singleton is mutated across modules and bundles; this escape hatch
    // keeps cross-module assignments compiling under strict mode.
    [key: string]: any;
}

declare global {
    interface Window {
        iframely?: Iframely;
    }
}

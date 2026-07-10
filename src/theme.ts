import iframely from './iframely';
import * as messaging from './messaging';

function setThemeInIframe(iframe: HTMLIFrameElement, theme: string): void {
    messaging.postMessage({
        method: 'setTheme',
        data: theme
    }, '*', iframe.contentWindow);
}

function setThemeInAllIframes(parent: Document | Element, theme: string): void {
    const iframes = parent.getElementsByTagName('iframe');
    for (let i = 0; i < iframes.length; i++) {
        setThemeInIframe(iframes[i], theme);
    }
}

export function boot(): void {

    iframely.setTheme = (theme, container?: Element) => {
        if (theme && iframely.SUPPORTED_THEMES.indexOf(theme) > -1) {
            if (container) {
                if (container.tagName === 'IFRAME') {
                    setThemeInIframe(container as HTMLIFrameElement, theme);
                } else {
                    setThemeInAllIframes(container, theme);
                }
            } else {
                // Send get param to next iframes.
                iframely.extendOptions({
                    theme: theme
                });
                setThemeInAllIframes(document, theme);
                iframely.trigger('set-theme', theme);
            }
        } else {
            console.warn('Using iframely.setTheme with not supported theme: "' + theme + '". Supported themes are: ' + iframely.SUPPORTED_THEMES.join(', '));
        }
    };
}

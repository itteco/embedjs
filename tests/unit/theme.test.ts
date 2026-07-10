import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import iframely from '../../src/iframely';
import { boot as bootConst } from '../../src/const';
import { boot as bootEvents } from '../../src/events';
import { boot as bootUtils } from '../../src/utils';
import { boot as bootTheme } from '../../src/theme';

beforeAll(() => {
    bootConst();
    bootEvents();
    bootUtils();
    bootTheme();
});

beforeEach(() => {
    iframely.config = {};
    document.body.innerHTML = '';
});

describe('setTheme', () => {

    it('stores a supported theme, notifies iframes and triggers set-theme', () => {
        document.body.innerHTML = '<iframe src="https://cdn.iframe.ly/x"></iframe>';
        const iframe = document.querySelector('iframe')!;
        const spy = vi.spyOn(iframe.contentWindow!, 'postMessage');
        const setThemeCb = vi.fn();
        iframely.on('set-theme', setThemeCb);

        iframely.setTheme('dark');

        expect(iframely.config.theme).toBe('dark');
        expect(setThemeCb).toHaveBeenCalledWith('dark');
        expect(JSON.parse(spy.mock.calls[0][0] as string)).toMatchObject({ method: 'setTheme', data: 'dark' });
    });

    it('scopes to a container element when provided, without touching config', () => {
        document.body.innerHTML =
            '<div id="scope"><iframe src="https://cdn.iframe.ly/a"></iframe></div>'
            + '<iframe id="outside" src="https://cdn.iframe.ly/b"></iframe>';
        const inside = document.querySelector<HTMLIFrameElement>('#scope iframe')!;
        const outside = document.querySelector<HTMLIFrameElement>('#outside')!;
        const insideSpy = vi.spyOn(inside.contentWindow!, 'postMessage');
        const outsideSpy = vi.spyOn(outside.contentWindow!, 'postMessage');

        iframely.setTheme('light', document.getElementById('scope')!);

        expect(insideSpy).toHaveBeenCalled();
        expect(outsideSpy).not.toHaveBeenCalled();
        expect(iframely.config.theme).toBeUndefined();
    });

    it('warns and does nothing for an unsupported theme', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        iframely.setTheme('neon');

        expect(warn).toHaveBeenCalled();
        expect(iframely.config.theme).toBeUndefined();
        warn.mockRestore();
    });
});

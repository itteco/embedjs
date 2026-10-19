import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import iframely from '../../src/iframely';
import { boot as bootConst } from '../../src/const';
import { boot as bootEvents } from '../../src/events';
import { boot as bootUtils } from '../../src/utils';
import { boot as bootDeprecated } from '../../src/deprecated';
import * as utils from '../../src/utils';

beforeAll(() => {
	bootConst();
	bootEvents();
	bootUtils();
});

beforeEach(() => {
	iframely.config = {};
	document.body.innerHTML = '';
});

describe('addQueryString', () => {
	it('appends params with ? for a bare href and & for an existing query', () => {
		expect(utils.addQueryString('//host/path', { a: 'b' })).toBe('//host/path?a=b');
		expect(utils.addQueryString('//host/path?x=1', { a: 'b' })).toBe('//host/path?x=1&a=b');
	});

	it('url-encodes values', () => {
		expect(utils.addQueryString('//host/p', { url: 'https://a.com/?x=1&y=2' })).toBe(
			'//host/p?url=' + encodeURIComponent('https://a.com/?x=1&y=2')
		);
	});

	it('converts booleans to 1/0 except for _-prefixed keys', () => {
		expect(utils.addQueryString('//host/p', { lazy: true, autoplay: false })).toBe(
			'//host/p?lazy=1&autoplay=0'
		);
		expect(utils.addQueryString('//host/p', { _opt: true })).toBe('//host/p?_opt=true');
	});

	it('expands arrays into repeated params', () => {
		expect(utils.addQueryString('//host/p', { uri: ['a', 'b'] })).toBe('//host/p?uri=a&uri=b');
	});

	it('skips undefined values and keys already present in the href', () => {
		expect(utils.addQueryString('//host/p?a=1', { a: '2', b: undefined, c: '3' })).toBe(
			'//host/p?a=1&c=3'
		);
	});
});

describe('parseQueryString', () => {
	it('parses all params without an allowlist', () => {
		expect(utils.parseQueryString('//host/p?a=1&b=x%20y')).toEqual({ a: '1', b: 'x y' });
	});

	it('returns an empty object without a query string', () => {
		expect(utils.parseQueryString('//host/p')).toEqual({});
	});

	it('filters by allowlist of strings and regexps', () => {
		const parsed = utils.parseQueryString('//h/p?api_key=k&_opt=1&evil=x', ['api_key', /^_.+/]);
		expect(parsed).toEqual({ api_key: 'k', _opt: '1' });
	});
});

describe('getEndpoint', () => {
	it('prefixes relative paths with the CDN and protocol slashes', () => {
		expect(utils.getEndpoint('/api/iframe', { url: 'https://x.com' })).toBe(
			'//cdn.iframe.ly/api/iframe?url=' + encodeURIComponent('https://x.com')
		);
	});

	it('prefers an explicit CDN option and removes it from the query', () => {
		const endpoint = utils.getEndpoint('/api/iframe', { CDN: '//other.cdn', url: 'u' });
		expect(endpoint).toBe('//other.cdn/api/iframe?url=u');
	});

	it('keeps absolute urls untouched apart from the query string', () => {
		expect(utils.getEndpoint('https://cdn.iframe.ly/abc', { v: 1 })).toBe(
			'https://cdn.iframe.ly/abc?v=1'
		);
	});

	it('adds matching iframely.config values for config_params, including regex matches', () => {
		iframely.configure({ api_key: 'KEY', _theme_opt: 'x', unrelated: 'nope' });
		const endpoint = utils.getEndpoint(
			'/api/iframe',
			{ url: 'u' },
			iframely.SUPPORTED_QUERY_STRING
		);
		expect(endpoint).toContain('api_key=KEY');
		expect(endpoint).toContain('_theme_opt=x');
		expect(endpoint).not.toContain('unrelated');
	});
});

describe('configure', () => {
	it('normalizes falsy/truthy string and number values to booleans', () => {
		iframely.configure({
			a: '0',
			b: 'false',
			c: 0,
			d: false,
			e: '1',
			f: 'true',
			g: 1,
			h: true,
			i: 'text'
		});
		expect(iframely.config).toEqual({
			a: false,
			b: false,
			c: false,
			d: false,
			e: true,
			f: true,
			g: true,
			h: true,
			i: 'text'
		});
	});

	it('does not override values previously disabled with false', () => {
		iframely.configure({ lazy: false });
		iframely.configure({ lazy: true });
		expect(iframely.config.lazy).toBe(false);
	});

	it('lets autorun be re-enabled after an entry disabled it', () => {
		// main.ts / main-options.ts write autorun = false at import time.
		iframely.config.autorun = false;
		iframely.configure({ autorun: true });
		expect(iframely.config.autorun).toBe(true);
	});

	it('ignores undefined options', () => {
		expect(() => iframely.configure(undefined)).not.toThrow();
	});

	it('keeps extendOptions as a deprecated alias', () => {
		bootDeprecated();
		expect(iframely.extendOptions).toBe(iframely.configure);
	});
});

describe('widget wrappers', () => {
	function buildWidgetDom(
		inner = '<iframe src="//cdn.iframe.ly/api/iframe?url=https%3A%2F%2Fx.com"></iframe>'
	) {
		document.body.innerHTML =
			'<div class="iframely-embed"><div class="iframely-responsive">' +
			inner +
			'</div></div>';
		return document.querySelector('.iframely-responsive')!.firstElementChild!;
	}

	it('getIframeWrapper finds both wrappers for a well-formed widget', () => {
		const iframe = buildWidgetDom();
		const wrapper = utils.getIframeWrapper(iframe, true)!;
		expect(wrapper.aspectWrapper.className).toBe('iframely-responsive');
		expect(wrapper.maxWidthWrapper.className).toBe('iframely-embed');
	});

	it('getIframeWrapper returns undefined without the wrapper structure', () => {
		document.body.innerHTML = '<div><iframe></iframe></div>';
		expect(utils.getIframeWrapper(document.querySelector('iframe')!, true)).toBeUndefined();
	});

	it('getWidget extracts the url from an iframe src url= param', () => {
		const iframe = buildWidgetDom();
		const widget = utils.getWidget(iframe)!;
		expect(widget.iframe).toBe(iframe);
		expect(widget.url).toBe('https://x.com');
	});

	it('getWidget extracts the url from an anchor href', () => {
		const a = buildWidgetDom('<a href="https://y.com/page" data-iframely-url></a>');
		const widget = utils.getWidget(a)!;
		expect(widget.url).toBe('https://y.com/page');
	});

	it('addDefaultWrappers inserts the two-wrapper structure before the element', () => {
		document.body.innerHTML = '<p><a id="link" href="https://x.com">x</a></p>';
		const a = document.getElementById('link')!;
		const wrapper = utils.addDefaultWrappers(a);
		expect(wrapper.maxWidthWrapper.className).toBe('iframely-embed');
		expect(wrapper.aspectWrapper.parentNode).toBe(wrapper.maxWidthWrapper);
		expect(wrapper.maxWidthWrapper.nextSibling).toBe(a);
	});
});

describe('setStyles', () => {
	it('converts numeric values to px', () => {
		const el = document.createElement('div');
		utils.setStyles(el, { height: 400, width: '250' });
		expect(el.style.height).toBe('400px');
		expect(el.style.width).toBe('250px');
	});

	it('keeps non-numeric string values as-is and skips max-width "keep"', () => {
		const el = document.createElement('div');
		el.style.maxWidth = '100px';
		utils.setStyles(el, { position: 'absolute', 'max-width': 'keep' });
		expect(el.style.position).toBe('absolute');
		expect(el.style.maxWidth).toBe('100px');
	});

	it('tolerates a missing element', () => {
		expect(() => utils.setStyles(null, { height: 1 })).not.toThrow();
	});
});

describe('createScript / applyNonce', () => {
	it('creates a script and applies the configured nonce', () => {
		iframely.config.nonce = 'abc123';
		const script = utils.createScript();
		expect(script.tagName).toBe('SCRIPT');
		expect(script.nonce).toBe('abc123');
	});

	it('leaves nonce empty when not configured', () => {
		const script = utils.createScript();
		expect(script.nonce).toBeFalsy();
	});
});

import type { ElementContext, FormElementType } from '../types';

const ESCAPE_MAP: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};

// Scalar interpolations are HTML-escaped; nullish renders as ''.
const esc = (value: string | number | boolean | undefined | null): string =>
	value == null ? '' : String(value).replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);

const templates: Record<FormElementType, (context: ElementContext) => string> = {
	checkbox: (ctx) => `
        <div class="iframely-option-check iframely-option-checkbox">
            <input type="checkbox" class="iframely-option-check__input" id="${esc(ctx.key)}" name="${esc(ctx.key)}"${ctx.checked ? ' checked="checked"' : ''}>
            <label class="iframely-option-check__label" for="${esc(ctx.key)}">${esc(ctx.label)}</label>
        </div>`,

	// The one place where pre-rendered child HTML is injected raw.
	group: (ctx) => `
        <div class="iframely-option">
            <div class="iframely-option__group">${ctx.elementsHtml ?? ''}</div>
        </div>`,

	radio: (ctx) => `
        <div class="iframely-option">
            ${ctx.label ? `<label class="iframely-option__label">${esc(ctx.label)}:</label>` : ''}
            <div class="iframely-option__group${ctx.inline ? ' iframely-option__group-inline' : ''}">
                ${(ctx.items || [])
					.map(
						(item) => `
                <div class="iframely-option-check iframely-option-radio">
                    <input type="radio" class="iframely-option-check__input" id="${esc(item.id)}" name="${esc(ctx.key)}" value="${esc(item.value)}"${item.checked ? ' checked="checked"' : ''}>
                    <label class="iframely-option-check__label" for="${esc(item.id)}">${esc(item.label)}</label>
                </div>`
					)
					.join('')}
            </div>
        </div>`,

	range: (ctx) => `
        <div class="iframely-option">
            <label class="iframely-option__label" for="${esc(ctx.key)}">${esc(ctx.label)}:</label>
            <div class="iframely-option__group">
                <input type="range" class="iframely-option__range" id="${esc(ctx.key)}" name="${esc(ctx.key)}" min="${esc(ctx.min)}" max="${esc(ctx.max)}" step="1" value="${esc(ctx.value)}" style="--min: ${esc(ctx.min)}; --max: ${esc(ctx.max)}; --val: ${esc(ctx.value)};">
            </div>
        </div>`,

	select: (ctx) => `
        <div class="iframely-option">
            <label class="iframely-option__label" for="${esc(ctx.key)}">${esc(ctx.label)}:</label>
            <div class="iframely-option__group">
                <select class="iframely-option__input iframely-option__select" id="${esc(ctx.key)}" name="${esc(ctx.key)}">
                    ${(ctx.items || []).map((item) => `<option value="${esc(item.value)}"${item.checked ? ' selected' : ''}>${esc(item.label)}</option>`).join('')}
                </select>
            </div>
        </div>`,

	text: (ctx) => `
        <div class="iframely-option">
            <label class="iframely-option__label" for="${esc(ctx.key)}">${esc(ctx.label)}:</label>
            <div class="iframely-option__group">
                <input type="${esc(ctx.inputType)}" class="iframely-option__input iframely-option__text" id="${esc(ctx.key)}" name="${esc(ctx.key)}" placeholder="${esc(ctx.placeholder)}" value="${esc(ctx.value)}">
            </div>
        </div>`
};

export type Renderer = (type: FormElementType, context: ElementContext) => string;

const render: Renderer = (type, context) => templates[type](context);

export default render;

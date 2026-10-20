import type { ElementContext, FormElementType } from '../types.js';
export type Renderer = (type: FormElementType, context: ElementContext) => string;
declare const render: Renderer;
export default render;

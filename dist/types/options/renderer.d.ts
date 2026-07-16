import type { ElementContext, FormElementType } from '../types';
export type Renderer = (type: FormElementType, context: ElementContext) => string;
declare const render: Renderer;
export default render;

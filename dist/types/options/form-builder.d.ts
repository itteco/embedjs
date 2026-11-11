import type { Renderer } from './renderer.js';
import type { TranslatorFn, WidgetOptions } from '../types.js';
export interface FormBuilderParams {
    id: string;
    formContainer: HTMLElement;
    options?: WidgetOptions;
    renderer: Renderer;
    translator?: TranslatorFn | null;
}
export default function formBuilder(params: FormBuilderParams): void;
//# sourceMappingURL=form-builder.d.ts.map
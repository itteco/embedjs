import type { Renderer } from './renderer';
import type { TranslatorFn, WidgetOptions } from '../types';
export interface FormBuilderParams {
    id: string;
    formContainer: HTMLElement;
    options?: WidgetOptions;
    renderer: Renderer;
    translator?: TranslatorFn | null;
}
export default function formBuilder(params: FormBuilderParams): void;

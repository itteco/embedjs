import iframely from '../iframely';
import formBuilder from './form-builder';
import renderer from './renderer';

export function boot(): void {

    iframely.buildOptionsForm = (id, formContainer, options, translator) => {
        formBuilder({
            id: id,
            formContainer: formContainer,
            options: options,
            renderer: renderer,
            translator: translator
        });
    };
}

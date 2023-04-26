import { RemoteTemplate } from './RemoteTemplate.js';

export class BaseComponent extends HTMLElement {
    constructor(templateURL, stylesURL) {
        super();

        this.initTemplate(templateURL, stylesURL);
    }

    async initTemplate(templateURL, stylesURL) {
        this.template = new RemoteTemplate(this.shadowRoot, templateURL, stylesURL);
        await this.template.load();
    }
}

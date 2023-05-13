import { RemoteTemplate } from './remote-template.js';

export class BaseComponent extends HTMLElement {
    constructor(url, options = { mode: 'open', styles: true }) {
        super();

        const { mode, styles } = options;
        const basePath = new URL(url).pathname.replace(/.js$/, '');
        const templateURL = `${basePath}.html`;
        const stylesURL = styles ? `${basePath}.css` : null;

        this.attachShadow({ mode });
        this.initTemplate(templateURL, stylesURL);
    }

    async initTemplate(templateURL, stylesURL) {
        this.template = new RemoteTemplate(this.shadowRoot, templateURL, stylesURL);
        await this.template.load();
    }
}

import { updateTemplate } from './dynamic-template.js';
import { getRemoteTemplate } from './remote-template.js';

// TODO fix conditional slot switcing
// input props vs component state
// documentation
export class BaseComponent extends HTMLElement {
    static get observedAttributes() { return [ 'data-custom-props' ]; }

    constructor(url, options = { mode: 'open', withStyles: true, dynamic: true }) {
        super();
        const { mode, withStyles, dynamic } = options;
        this.attachShadow({ mode });
        this.initTemplate(url, withStyles, dynamic);
    }

    async initTemplate(url, withStyles, dynamic) {
        const basePath = new URL(url).pathname.replace(/.js$/, '');
        const templateURL = `${basePath}.html`;
        const stylesURL = withStyles ? `${basePath}.css` : null;
        this.shadowRoot.innerHTML = await getRemoteTemplate(templateURL, stylesURL);

        if (dynamic) {
            this.dynamic = dynamic;
            this.ifMap = { count: 0, onFalse: {}, onTrue: {} };
            this.setProps(JSON.parse(this.dataset.customProps));
        }
    }

    setProps(props) {
        if (props === this.props) {
            return;
        }
        this.oldProps = this.props || {};
        this.props = props;
        updateTemplate(this.shadowRoot, this);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name !== 'data-custom-props' || !this.dynamic) {
            return;
        }

        const customProps = JSON.parse(newValue);
        this.setProps(customProps);
    };
}

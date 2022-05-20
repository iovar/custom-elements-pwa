import { RemoteTemplate } from './RemoteTemplate.js';
import { StateRenderer } from './StateRenderer.js';
import { subscribeToNamedStore, unsubscribeFromNamedStore } from './store.js';

export class BaseComponent extends HTMLElement {
    static get observedAttributes() { return [ 'state-key', 'state' ]; }

    constructor(templateURL, stylesURL) {
        super();

        this.ifMap = { count: 0, onFalse: {}, onTrue: {} };
        this.attachShadow({ mode: 'open' });
        this.initTemplate(templateURL, stylesURL);
        this.stateRenderer = new StateRenderer(this.shadowRoot);
    }

    async initTemplate(templateURL, stylesURL) {
        this.template = new RemoteTemplate(this.shadowRoot, templateURL, stylesURL);
        await this.template.load();
        this.stateRenderer.updateTemplate(this.shadowRoot);
    }

    subscribe(key) {
        const namespace = this.getAttribute('namespace');
        this.stateRenderer.setNamespace(namespace);

        if (key) {
            subscribeToNamedStore(key, this);
        }
    }

    unsubscribe(key) {
        if (key) {
            unsubscribeFromNamedStore(key, this);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'state-key') {
            this.unsubscribe(oldValue);
            this.subscribe(newValue);
        } else if (name === 'state') {
            try {
                const newState = JSON.parse(newValue);
                this.stateRenderer.setState(newState);
                this.stateRenderer.updateTemplate(this.shadowRoot);
            } catch {}
        }
    }
}

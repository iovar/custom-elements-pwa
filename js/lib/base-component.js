import { updateCallbackSlots, updateTemplate, getEmptyTemplateState } from './dynamic-template.js';
import { getRemoteTemplate } from './remote-template.js';

export class BaseComponent extends HTMLElement {
    static get observedAttributes() { return [ 'data-props' ]; }
    static defaultOptions = { mode: 'open', withStyles: true, dynamic: true, inline: false };
    state = getEmptyTemplateState();
    oldProps = {};

    constructor(url /* import.meta.url */, options = {}) {
        super();
        const { mode, ...restOptions } = { ...BaseComponent.defaultOptions, ...options };
        this.attachShadow({ mode });
        this.initTemplate(url, restOptions);
    }

    async initTemplate(url, { withStyles, dynamic, inline }) {
        if (inline) {
            this.shadowRoot.innerHTML = url;
        } else {
            this.shadowRoot.innerHTML = await getRemoteTemplate(url, withStyles);
        }

        if (dynamic) {
            this.dynamic = dynamic;
            this.props = this.dataset.props ? JSON.parse(this.dataset.props) : this.oldProps;
            updateCallbackSlots(this.shadowRoot, this);
            updateTemplate(this.shadowRoot, this.shadowRoot, this);
        }
    }

    setStateValues(values) {
        if (values !== this.state.values) {
            this.state = {
                ...this.state,
                values,
                oldValues: this.state.values,
            };
            updateTemplate(this.shadowRoot, this.shadowRoot, this);
        }
    }

    setProps(props) {
        if (props !== this.props) {
            this.oldProps = this.props || {};
            this.props = props;
            updateTemplate(this.shadowRoot, this.shadowRoot, this);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-props' && this.dynamic) {
            const props = JSON.parse(newValue);
            this.setProps(props);
        }
    };
}

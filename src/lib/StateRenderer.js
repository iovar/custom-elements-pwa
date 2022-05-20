import { RemoteTemplate } from './RemoteTemplate.js';

export class StateRenderer {
    constructor(templateRoot) {
        this.templateRoot = templateRoot;
        this.ifMap = { count: 0, onFalse: {}, onTrue: {} };
    }

    setState(state) {
        this.state = state;
    }

    setNamespace(namespace) {
        this.namespace = namespace;
    }

    updateTemplate(root, scope) {
        this.updateListSlots(root, scope);
        this.updateContentSlots(root, scope);
        this.updateAttrSlots(root, scope);
        this.updateConditionalSlots(root, scope);
    }

    updateContentSlots(root, scope) {
        const contentSlots = root.querySelectorAll('[data-content]');

        contentSlots.forEach((sl) => {
            const propName = sl.dataset.content;
            sl.innerHTML = this.select(propName, scope) || '';
        });
    }

    updateAttrSlots(root, scope) {
        const attrSlots = root.querySelectorAll('[data-attr]');

        attrSlots.forEach((sl) => {
            const attrName = sl.dataset.attr;
            const propName = sl.dataset.attrValue;

            if (!attrName) { return; }

            sl.setAttribute(attrName, this.select(propName, scope) || '');
        });
    }

    updateListSlots(root, scope) {
        const listSlots = root.querySelectorAll('[data-list]');

        listSlots.forEach((sl) => {
            const listName = sl.dataset.list;
            const templateName = sl.dataset.template;
            const template = templateName && this.templateRoot.querySelector(`template[data-name=${templateName}`);
            const listData = this.select(listName);

            if (!sl.shadowRoot) {
                sl.attachShadow({ mode: 'open' });
            }

            sl.shadowRoot.innerHTML = '';

            if (!listData || !listData.length) {
                return;
            }

            if (template) {
                listData.forEach((item, index) => {
                    const fragment = template.content.cloneNode(true);
                    const newChild = fragment.children[0];
                    if (typeof item !== 'object') {
                        newChild.innerHTML = item;
                    } else {
                        this.updateTemplate(newChild, `${listName}[${index}]`);
                    }
                    sl.shadowRoot.appendChild(newChild);
                });
            } else {
                listData.forEach((item, index) => {
                    const li = document.createElement('li');
                    li.innerHTML = item;
                    sl.shadowRoot.appendChild(li);
                });
            }
        });
    }

    updateConditionalSlots(root, scope) {
        const ifSlots = root.querySelectorAll('[data-if]');
        const ifNotSlots = root.querySelectorAll('[data-if-not]');

        ifSlots.forEach((sl) => {
            const propName = sl.dataset.if;
            const value = this.select(propName, scope);

            if (value) {
                this.toggleVisibility(sl, true);
            }
        });

        ifNotSlots.forEach((sl) => {
            const propName = sl.dataset.ifNot;
            const value = this.select(propName, scope);

            if (!value) {
                this.toggleVisibility(sl, false);
            }
        });
    }

    toggleVisibility(elem, onTrue) {
        if(!elem.dataset.prvIfMapIndex) {
            this.createPlaceholder(elem, onTrue);
        }

        if (onTrue) {
            elem.replaceWith(this.ifMap.onFalse[elem.dataset.prvIfMapIndex]);
        } else {
            elem.replaceWith(this.ifMap.onTrue[elem.dataset.prvIfMapIndex]);
        }
    }

    createPlaceholder(elem, onTrue) {
        elem.dataset.prvIfMapIndex = this.ifMap.count;
        this.ifMap.count = this.ifMap.count + 1;

        const placeholder = document.createElement('script');
        placeholder.setAttribute('type', 'placeholder/if');
        placeholder.dataset.prvIfMapIndex = elem.dataset.prvIfMapIndex;

        if (onTrue) {
            placeholder.dataset.ifNot = elem.dataset.if;
            this.ifMap.onFalse[elem.dataset.prvIfMapIndex] = placeholder;
            this.ifMap.onTrue[elem.dataset.prvIfMapIndex] = elem;
        } else {
            placeholder.dataset.if= elem.dataset.ifNot;
            this.ifMap.onTrue[elem.dataset.prvIfMapIndex] = placeholder;
            this.ifMap.onFalse[elem.dataset.prvIfMapIndex] = elem;
        }
    }

    select(propName, scope) {
        if (!this.state || (this.namespace && !this.state[this.namespace])) {
            return;
        }

        const state = this.getCurrentState(scope);

        const indexedAccess = propName.match(/\[[0-9a-zA-Z_'"-]+\]$/);

        if (indexedAccess) {
            const index = indexedAccess[0].replace(/['"\[\]]/g,'');
            const indexable = propName.replace(indexedAccess[0], '');

            return state[indexable] && state[indexable][index];
        }

        return state[propName];
    }

    getCurrentState(scope) {
        const indexedAccess = scope && scope.match(/\[[0-9a-zA-Z_'"-]+\]$/);

        if (this.namespace && indexedAccess) {
            const index = indexedAccess[0].replace(/['"\[\]]/g,'');
            const indexable = scope.replace(indexedAccess[0], '');
            return this.state[this.namespace][indexable][index];
        } else if (this.namespace && scope) {
            return this.state[this.namespace][scope];
        } else if(this.namespace) {
            return this.state[this.namespace];
        }

        return this.state;
    }
}

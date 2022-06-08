/*
 * Implements simple state management & templating
 *
 * data-content=var : contents of element are replaced with value of var
 *
 * data-attr=var
 * data-attr-value=val : attribute named var of element, gets set to val
 *
 * data-if=var : show element if var is true
 *
 * data-if-not=var : show element if var is false
 *
 * data-list=var
 * data-template=templ: for each element in list var, render either a <li>
 *                      element if no template (templ) is provided, or render
 *                      the contents of templ, and extrapolate any possible
 *                      template values
 */

export class StateRenderer {
    constructor(templateRoot) {
        this.templateRoot = templateRoot;
        this.ifMap = { count: 0, onFalse: {}, onTrue: {} };
    }

    setState(state) {
        this.oldState = this.state;
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

            if (!this.isValueChanged(propName, scope)) {
                return
            }

            if (!attrName) { return; }

            sl.setAttribute(attrName, this.select(propName, scope) || '');
        });
    }

    updateListSlots(root, scope) {
        const listSlots = root.querySelectorAll('[data-list]');

        listSlots.forEach((sl) => {
            const listName = sl.dataset.list;

            if (!this.isValueChanged(listName, scope)) {
                return
            }

            const templateName = sl.dataset.template;
            const template = templateName && this.templateRoot.querySelector(`template[data-name=${templateName}`);
            const listData = this.select(listName, scope);

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

            if (!this.isValueChanged(propName, scope)) {
                return
            }

            const value = this.select(propName, scope);

            if (value) {
                this.toggleVisibility(sl, true);
            }
        });

        ifNotSlots.forEach((sl) => {
            const propName = sl.dataset.ifNot;

            if (!this.isValueChanged(propName, scope)) {
                return
            }

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

    isValueChanged(propName, scope) {
        const newValue = this.select(propName, scope);
        const oldValue = this.select(propName, scope, this.oldState);

        if (oldValue === newValue) {
            return false;
        }

        if (typeof newValue !== typeof oldValue) {
            return true;
        }

        if (typeof newValue === 'object') {
            return JSON.stringify(newValue) !== JSON.stringify(oldValue);
        }

        return true;
    }

    select(propName, scope, state = this.state) {
        if (!state || (this.namespace && !state[this.namespace])) {
            return;
        }

        const currentState = this.getSubState(scope, state);

        const indexedAccess = propName.match(/\[[0-9a-zA-Z_'"-]+\]$/);

        if (indexedAccess) {
            const index = indexedAccess[0].replace(/['"\[\]]/g,'');
            const indexable = propName.replace(indexedAccess[0], '');

            return currentState[indexable] && currentState[indexable][index];
        }

        return currentState[propName];
    }

    getSubState(scope, state) {
        const indexedAccess = scope && scope.match(/\[[0-9a-zA-Z_'"-]+\]$/);

        if (this.namespace && indexedAccess) {
            const index = indexedAccess[0].replace(/['"\[\]]/g,'');
            const indexable = scope.replace(indexedAccess[0], '');
            return state[this.namespace][indexable][index];
        } else if (this.namespace && scope) {
            return state[this.namespace][scope];
        } else if(this.namespace) {
            return state[this.namespace];
        }

        return state;
    }
}

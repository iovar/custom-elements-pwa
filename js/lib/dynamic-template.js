const SELECTORS = [ '[data-content]', '[data-attr]', '[data-list]', '[data-if]', '[data-callback]' ];
const FLAT_SELECTORS = SELECTORS.map((selector) => `:not([data-list] ${selector})${selector}`);

export function getEmptyTemplateState() {
    const conditionalSlots = {
        count: 0,
        showOnFalse: {},
        showOnTrue: {},
    };
    const eventListeners = [];
    const listSlots = { templates: {} };

    return { eventListeners, conditionalSlots, listSlots, values: {} };
}

function isValueChanged(propName, scope, oldScope) {
    const newValue = scope[propName];
    const oldValue = oldScope?.[propName];

    if (oldValue === newValue) {
        return false;
    }

    return JSON.stringify(newValue) !== JSON.stringify(oldValue);
}

function getValueFromContext(name, { state, props, oldProps }) {
    return props?.hasOwnProperty(name)
        ?  {
            value: props[name],
            oldValue: oldProps?.[name],
            changed: isValueChanged(name, props, oldProps),
        } : {
            value: state.values[name],
            oldValue: state.oldValues?.[name],
            changed: isValueChanged(name, state.values, state.oldValue),
        };
}

function getListTemplate(root, templateName, context) {
    const existing = context.state.listSlots.templates[templateName];
    if (existing) {
        return existing;
    }

    const newTemplate = templateName && root.querySelector(`template[data-name=${templateName}`);
    context.state.listSlots.templates = {
        ...context.state.listSlots.templates,
        [templateName]: newTemplate,
    };
    return newTemplate;
}

function createConditionalPlaceholder(elem, showOnTrue, conditionalSlots) {
    elem.dataset.slotIndex = conditionalSlots.count++;

    const placeholder = document.createElement('script');
    placeholder.setAttribute('type', 'placeholder/if');
    placeholder.dataset.slotIndex = elem.dataset.slotIndex;
    placeholder.dataset.if = showOnTrue ? `not:${elem.dataset.if}` : elem.dataset.if.split(':')[1];

    if (showOnTrue) {
        conditionalSlots.showOnFalse[elem.dataset.slotIndex] = placeholder;
        conditionalSlots.showOnTrue[elem.dataset.slotIndex] = elem;
    } else {
        conditionalSlots.showOnTrue[elem.dataset.slotIndex] = placeholder;
        conditionalSlots.showOnFalse[elem.dataset.slotIndex] = elem;
    }
}

function toggleConditionalVisibility(elem, showOnTrue, value, context) {
    const { state: { conditionalSlots } } = context;
    if(!elem.dataset.slotIndex) {
        createConditionalPlaceholder(elem, showOnTrue, conditionalSlots);
    }

    if (showOnTrue !== value && elem !== conditionalSlots.showOnFalse[elem.dataset.slotIndex]) {
        elem.replaceWith(conditionalSlots.showOnFalse[elem.dataset.slotIndex]);
        updateTemplate(conditionalSlots.showOnFalse[elem.dataset.slotIndex], context);
    } else if (showOnTrue !== value && elem !== conditionalSlots.showOnTrue[elem.dataset.slotIndex]) {
        elem.replaceWith(conditionalSlots.showOnTrue[elem.dataset.slotIndex]);
        updateTemplate(conditionalSlots.showOnTrue[elem.dataset.slotIndex], context);
    }
}

function updateContentSlots(root, context) {
    const contentSlots = root.querySelectorAll(FLAT_SELECTORS[0]);

    contentSlots.forEach((elem) => {
        const propName = elem.dataset.content;
        const { value, changed } = getValueFromContext(propName, context);

        if (changed) {
            elem.innerHTML = `${value}` || '';
        }
    });
}

function updateAttrSlots(root, context) {
    const attrSlots = root.querySelectorAll(FLAT_SELECTORS[1]);

    attrSlots.forEach((elem) => {
        const [ attrName, propName ] = elem.dataset.attr.split(':');
        const { value, changed } = getValueFromContext(propName, context);

        if (changed && attrName) {
            elem.setAttribute(attrName, value || '');
        }
    });
}

function updateListSlots(root, context) {
    const listSlots = root.querySelectorAll(FLAT_SELECTORS[2]);

    listSlots.forEach((elem) => {
        const [ listName, templateName ] = elem.dataset.list.split(':');
        const template = getListTemplate(root, templateName, context);
        const { value, oldValue, changed } = getValueFromContext(listName, context);

        if (changed && value && template) {
            elem.innerHTML = '';
            value.forEach((item, index) => {
                const fragment = template.content.cloneNode(true);
                const newChild = fragment.children[0];
                const subContext = {
                    ...context,
                    props: value[index],
                };
                updateTemplate(newChild, subContext);
                elem.appendChild(newChild);
            });
        }
    });
}

function updateConditionalSlots(root, context) {
    const ifSlots = root.querySelectorAll(FLAT_SELECTORS[3]);

    ifSlots.forEach((elem) => {
        const parts = elem.dataset.if.split(':');
        const showOnTrue = parts.length !== 2 || parts[0] !== 'not';
        const propName = parts[parts.length - 1];
        const { value, oldValue, changed } = getValueFromContext(propName, context);

        if (changed) {
            toggleConditionalVisibility(elem, showOnTrue, value, context);
        }
    });
}

export function updateCallbackSlots(root, context) {
    const callbackSlots = root.querySelectorAll(FLAT_SELECTORS[4]);

    callbackSlots.forEach((elem) => {
        const [ event, handler ] = elem.dataset.callback.split(':');
        const handlerWithScope = (...props) => context[handler](...props);
        elem.addEventListener(event, handlerWithScope);

        context.state.eventListeners = [
            ...context.state.eventListeners,
            { elem, event, handler: handlerWithScope }
        ];
    });
}

export function updateTemplate(root, context) {
    updateListSlots(root, context);
    updateContentSlots(root, context);
    updateAttrSlots(root, context);
    updateConditionalSlots(root, context);
}

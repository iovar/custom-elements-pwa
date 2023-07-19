const SELECTORS = [ '[data-content]', '[data-attr]', '[data-list]', '[data-if]', '[data-callback]' ];
const FLAT_SELECTORS = SELECTORS.map((selector) => `:not([data-list] ${selector})${selector}`);

function isValueChanged(propName, scope, oldScope) {
    const newValue = scope[propName];
    const oldValue = oldScope?.[propName];

    if (oldValue === newValue) {
        return false;
    }

    return JSON.stringify(newValue) !== JSON.stringify(oldValue);
}

function updateContentSlots(root, context) {
    const contentSlots = root.querySelectorAll(FLAT_SELECTORS[0]);
    const { props, oldProps } = context;

    contentSlots.forEach((sl) => {
        const propName = sl.dataset.content;

        if (!isValueChanged(propName, props, oldProps)) {
            return
        }

        sl.innerHTML = `${props[propName]}` || '';
    });
}

function updateAttrSlots(root, context) {
    const attrSlots = root.querySelectorAll(FLAT_SELECTORS[1]);
    const { props, oldProps } = context;

    attrSlots.forEach((sl) => {
        const [ attrName, propName ] = sl.dataset.attr.split(':');

        if (!isValueChanged(propName, props, oldProps)) {
            return
        }

        if (!attrName) { return; }

        sl.setAttribute(attrName, props[propName] || '');
    });
}

function updateListSlots(root, context) {
    const listSlots = root.querySelectorAll(FLAT_SELECTORS[2]);
    const { props, oldProps } = context;

    listSlots.forEach((sl) => {
        const [ listName, templateName ] = sl.dataset.list.split(':');

        if (!isValueChanged(listName, props, oldProps)) {
            return
        }

        const template = templateName && root.querySelector(`template[data-name=${templateName}`);
        const listData = props[listName];

        if (!listData || !listData.length || !template) {
            return;
        }

        listData.forEach((item, index) => {
            const fragment = template.content.cloneNode(true);
            const newChild = fragment.children[0];
            const subContext = {
                ...context,
                props: props[listName][index],
                oldProps: oldProps[listName]?.[index]
            };
            updateTemplate(newChild, subContext);
            sl.appendChild(newChild);
        });
    });
}

function updateCallbackSlots(root, context) {
    const callbackSlots = root.querySelectorAll(FLAT_SELECTORS[4]);

    callbackSlots.forEach((sl) => {
        const [ event, handler ] = sl.dataset.callback.split(':');
        sl[event] = context[handler];
    });
}


function createPlaceholder(elem, onTrue, context) {
    elem.dataset.prvIfMapIndex = context.ifMap.count++;

    const placeholder = document.createElement('script');
    placeholder.setAttribute('type', 'placeholder/if');
    placeholder.dataset.prvIfMapIndex = elem.dataset.prvIfMapIndex;
    placeholder.dataset.if = elem.dataset.if;

    console.log('here', onTrue, context.ifMap);
    if (onTrue) {
        context.ifMap.onFalse[elem.dataset.prvIfMapIndex] = placeholder;
        context.ifMap.onTrue[elem.dataset.prvIfMapIndex] = elem;
    } else {
        context.ifMap.onTrue[elem.dataset.prvIfMapIndex] = placeholder;
        context.ifMap.onFalse[elem.dataset.prvIfMapIndex] = elem;
    }
}

function toggleVisibility(elem, onTrue, value, context) {
    if(!elem.dataset.prvIfMapIndex) {
        createPlaceholder(elem, onTrue, context);
    }

    console.log(onTrue, value);
    if (onTrue && value && elem !== context.ifMap.onFalse[elem.dataset.prvIfMapIndex]) {
        console.log('rep',context.ifMap.onFalse[elem.dataset.prvIfMapIndex] );
        elem.replaceWith(context.ifMap.onFalse[elem.dataset.prvIfMapIndex]);
    } else if (!onTrue && !value && elem !== context.ifMap.onTrue[elem.dataset.prvIfMapIndex]) {
        console.log('rep',context.ifMap.onTrue[elem.dataset.prvIfMapIndex] );
        elem.replaceWith(context.ifMap.onTrue[elem.dataset.prvIfMapIndex]);
    }
}

function updateConditionalSlots(root, context) {
    const ifSlots = root.querySelectorAll(FLAT_SELECTORS[3]);
    const { props, oldProps } = context;

    ifSlots.forEach((sl) => {
        const parts = sl.dataset.if.split(':');
        const onFalse = parts.length === 2 && parts[0] === 'not';
        const propName = parts[parts.length - 1];

        if (!isValueChanged(propName, props, oldProps)) {
            return;
        }

        toggleVisibility(sl, !onFalse, props[propName], context);
    });
}

export function updateTemplate(root, context) {
    updateListSlots(root, context);
    updateContentSlots(root, context);
    updateAttrSlots(root, context);
    updateConditionalSlots(root, context);
    updateCallbackSlots(root, context);
}

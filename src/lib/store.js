const store = {};

export function subscribeToNamedStore(name, component) {
    if (store[name]) {
        store[name].components.push(component);
    } else {
        store[name] = { state: {}, components: [component] };
    }
}

export function unsubscribeFromNamedStore(name, component) {
    if (store[name]) {
        store[name].components = store[name].components.filter((c) => c !== component);
    }
}

export function postMessage(type, payload) {
    window.postMessage({ type, payload });
}

export function registerReducer(messages, storeName, reducer) {
    window.addEventListener(
        'message',
        ({ data }) => {
            if (messages.includes(data.type) && store[storeName]) {
                store[storeName].state = reducer(data, store[storeName].state);
                store[storeName].components.forEach((c) => (
                    c.setAttribute(storeName, JSON.stringify(store[storeName].state))
                ));
            }
        }
    );

    return { removeReducer: () => window.removeEventListener('message', callback) };
}

export function registerComponentReducers(components, storeName) {
    const actions = components.reduce((accum, component) => {
        if (component.actions) {
            return [...component.actions, ...accum];
        }

        return accum;
    }, []);

    const reducers = components.reduce((accum, component) => {
        if (component.reducer) {
            return [component.reducer, ...accum];
        }

        return accum;
    }, []);

    const combinedReducer = (action, state) => (
        reducers.reduce((accum, reducer) => (
            reducer(action, accum)
        ), state)
    );

    registerReducer(actions, storeName, combinedReducer);
}

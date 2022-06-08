import { BaseComponent } from '../lib/BaseComponent.js';
import { postMessage } from '../lib/store.js';

export class DartComponent extends BaseComponent {
    static get actions() { return [
        'dart-count-change',
    ]; }

    static reducer(action, state) {
        if (action.type === 'dart-count-change') {
            return {
                ...state,
                dart: {
                    ...(state.dart || {}),
                    count: action.payload,
                    input: [action.payload, `${action.payload} + 1`],
                    list: (state && state.dart && state.dart.list) || [1, 2, 3],
                    list2: [
                        { test: 't3', input: [action.payload + 4], count: action.payload + 4 },
                        { test: 't2', input: [action.payload + 5], count: action.payload + 5 },
                        { test: 't1', input: [action.payload + 6], count: action.payload + 6 },
                    ],
                }
            };
        }

        return state;
    }

    constructor() {
        super('components/Dart.html', 'components/Dart.css');

        let count = 0;
        postMessage('dart-count-change', count);
        setInterval(() => {
            postMessage('dart-count-change', count++);
        }, 3000);
    }
}

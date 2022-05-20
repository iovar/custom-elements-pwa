import { BaseComponent } from '../lib/BaseComponent.js';

export class DartBoardComponent extends BaseComponent {
    static get actions() { return [
        'dartboard-count-change',
    ]; }

    static reducer(action, state) {
        if (action.type === 'dartboard-count-change') {
            return {
                ...state,
                dartboard: {
                    ...(state.dartboard || {}),
                    count: action.payload,
                }
            };
        }

        return state;
    }

    constructor() {
        super('components/DartBoard.html', 'components/DartBoard.css');
    }
}

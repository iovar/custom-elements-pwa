import { BaseComponent } from '../lib/BaseComponent.js';
import { postMessage } from '../lib/store.js';

export class SceneComponent extends BaseComponent {
    constructor() {
        super('components/Scene.html', 'components/Scene.css');
    }
}

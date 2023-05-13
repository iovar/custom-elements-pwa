import { BaseComponent } from '/js/lib/base-component.js';

export class Viewport extends BaseComponent {
    constructor() {
        super(import.meta.url);
    }
}

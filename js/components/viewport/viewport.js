import { BaseComponent } from '/js/lib/base-component.js';

export class Viewport extends BaseComponent {
    constructor() {
        super(import.meta.url);
        this.update();
    }

    update() {
        setInterval(() => {
            const props = JSON.parse(this.dataset.customProps);

            props.flag = !props.flag;
            props.val = props.val + 1;
            this.dataset.customProps = JSON.stringify(props);
        }, 3000);
    }

    click() {
        console.log('click');
    }
}

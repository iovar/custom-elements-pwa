import { BaseComponent } from '/js/lib/base-component.js';

export class Viewport extends BaseComponent {
    constructor() {
        super(import.meta.url);
        this.update();
    }

    update() {
        setInterval(() => {
            const props = JSON.parse(this.dataset.props);
            props.flag = !props.flag;
            this.dataset.props = JSON.stringify(props);
        }, 3000);

        setTimeout(() => {
            const props = this.dataset.props ? JSON.parse(this.dataset.props) : { items: [] };
            props.items = [...props.items, { value: 5 } ];
            this.setStateValues({
                ...this.state.values,
                stateVal: 'some state value',
            });
            this.dataset.props = JSON.stringify(props);
        }, 1000);

        setInterval(() => {
            const props = this.dataset.props ? JSON.parse(this.dataset.props) : { items: [] };
            props.val = props.val + 1;
            this.dataset.props = JSON.stringify(props);
        }, 1245);
    }

    click() {
        console.log('click', this.props.items.length);
    }
}

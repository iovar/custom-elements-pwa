import { registerComponentReducers } from './lib/store.js';
import { DartComponent } from './components/Dart.js';

customElements.define('dart-component', DartComponent);

registerComponentReducers([
    DartComponent,
], 'state');

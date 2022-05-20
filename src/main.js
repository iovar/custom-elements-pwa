import { registerComponentReducers } from './lib/store.js';
import { DartComponent } from './components/Dart.js';
import { DartBoardComponent } from './components/DartBoard.js';

customElements.define('dart-component', DartComponent);
customElements.define('dartboard-component', DartBoardComponent);


registerComponentReducers([
    DartComponent,
    DartBoardComponent,
], 'state');

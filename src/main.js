import { registerComponentReducers } from './lib/store.js';
import { DartComponent } from './components/Dart.js';
import { SceneComponent } from './components/Scene.js';

customElements.define('dart-component', DartComponent);
customElements.define('scene-component', SceneComponent);

registerComponentReducers([
    DartComponent,
], 'state');

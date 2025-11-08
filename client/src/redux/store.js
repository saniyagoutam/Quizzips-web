//redux/store.js

import { createStore } from 'redux';

/** call reducers */
import rootReducer from './reducers'; // adjust path as needed

const store = createStore(rootReducer);

export default store;
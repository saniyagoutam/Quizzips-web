// reducers.js
import { combineReducers } from 'redux';
import authReducer from './authReducer';
import examReducer from './examReducer';

// Combine and re-export reducers for the store to import as './reducers'
const rootReducer = combineReducers({
  auth: authReducer,
  exam: examReducer
});

export default rootReducer;
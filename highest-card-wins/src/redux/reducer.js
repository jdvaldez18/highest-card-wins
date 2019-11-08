import { combineReducers } from 'redux';
import userReducer from './userReducer';
import pageReducer from './pageReducer';
import roomReducer from './roomReducer';

const rootReducer = combineReducers({
    user: userReducer,
    page: pageReducer,
    room: roomReducer,
});

export default rootReducer;
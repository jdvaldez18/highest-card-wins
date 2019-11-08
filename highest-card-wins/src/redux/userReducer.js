const initialState = {
    token: null,
    username: null,
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_TOKEN':
            return {
                username: state.username,
                token: action.token,
            };
        case 'SET_USERNAME':
            return {
                username: action.username,
                token: state.token,
            };
        case 'GET_TOKEN':
        case 'GET_USERNAME':
        default:
            return state
    }
};

export default userReducer;
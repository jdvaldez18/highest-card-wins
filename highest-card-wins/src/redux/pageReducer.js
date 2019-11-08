const initialState = {
    setPage: null,
};

const pageReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_SETPAGE':
            return {
                setPage: action.setPage,
            };
        case 'GET_SETPAGE':
        default:
            return state
    }
};

export default pageReducer;
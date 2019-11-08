const initialState = {
    room: null,
    playerNum: null,
};

const roomReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_ROOM':
            return {
                room: action.room,
                playerNum: state.playerNum,
            };
        case 'SET_PLAYERNUM':
            return {
                room: state.room,
                playerNum: action.playerNum,
            };
        case 'GET_ROOM':
        default:
            return state
    }
};

export default roomReducer;
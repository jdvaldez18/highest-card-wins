export const setRoom = (room) => {
    return {
        type: 'SET_ROOM',
        room: room,
    };
};

export const setPlayerNum = (playerNum) => {
    return {
        type: 'SET_PLAYERNUM',
        playerNum: playerNum,
    };
};

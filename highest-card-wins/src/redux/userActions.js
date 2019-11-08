export const setToken = (token) => {
    return {
        type: 'SET_TOKEN',
        token: token,
    };
};

export const setUsername = (username) => {
    return {
        type: 'SET_USERNAME',
        username: username,
    };
};

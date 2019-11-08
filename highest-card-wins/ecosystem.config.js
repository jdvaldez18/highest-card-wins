module.exports = {
  apps: [
    // {
    //   name: 'gateway',
    //   script: 'gateway.js',
    //   cwd: './server',
    //   instances: 1,
    // },
    {
      name: 'users',
      script: 'users.js',
      cwd: './server',
      instances: 1,
    },
    {
      name: 'lobby',
      script: 'lobby.js',
      cwd: './server',
      instances: 1,
    },
    {
      name: 'winner',
      script: 'winner.js',
      cwd: './server',
      instances: 1,
    },
    // {
    //   name: 'game',
    //   script: 'game.js',
    //   cwd: './server',
    //   instances: 1,
    // },
  ]
};

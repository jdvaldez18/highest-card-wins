const io = require('socket.io')(5000);
const redis = require('redis');
const client = redis.createClient();
const hash = require('object-hash');
const axios = require('axios');

const royal = ['J', 'Q', 'K', 'A'];
const suits = ['C', 'D', 'H', 'S'];
let heirarchy = [];
for (let i = 2; i <= 14; ++i) {
    for (let j = 0; j < 4; ++j) {
        if (i <= 10)
            heirarchy.push(`${i}${suits[j]}`);
        else
            heirarchy.push(`${royal[(i - 1) % 10]}${suits[j]}`);
    }
}

printRedis = (reply, toClient) => {
    client.get(`currentRoom`, (err, currentRoom) => {
        client.get(`${reply}:player1`, (err, p1) => {
            client.get(`${reply}:player2`, (err, p2) => {
                client.get(`${reply}:player3`, (err, p3) => {
                    client.get(`${reply}:player4`, (err, p4) => {
                        const players = {
                            room: currentRoom,
                            players: [
                                p1,
                                p2,
                                p3,
                                p4,
                            ],
                        };
                        console.log(players);
                        toClient(players);
                        io.emit(reply, players);
                    });
                });
            });
        });
    });
}

function getCardFromDeck(room, fn) {
    // Calculate a random card
    const suitStr = suits[Math.floor(Math.random() * 4)];
    const numStr = Math.floor(Math.random() * 13) < 9
        ? Math.floor(Math.random() * 9) + 2
        : royal[Math.floor(Math.random() * 4)];
    const card = numStr + suitStr;
    console.log('Trying: ' + card);

    // Get list of used cards
    client.get(`${room}:deck`, (err, deck) => {
        const deckArr = deck.split(':');

        // Find if any cards were already used
        for (let i = 1; i < deckArr.length; ++i) {
            console.log("Checking against: " + deckArr[i]);
            if (card === deckArr[i]) {
                console.log('Match, trying another...');
                // If so, try again
                getCardFromDeck(room, fn);
                return;
            }
        }

        // If not
        // Add a new card to the removed card list
        // and push it into redis
        const newDeck = deck + `:${card}`;
        console.log('newDeck: ' + newDeck);
        client.set(`${room}:deck`, newDeck);
        fn(card);
    })

}

io.on('connection', (socket) => {
    // client.on('subscribeToTimer', (interval) => {
    console.log('client looking for a room...');

    socket.on('register', (username, toClient) => {
        console.log(username);
        // fn("abc");

        // Get the currently filling room
        client.get("currentRoom", function (err, reply) {
            // reply is null when the key is missing
            if (!reply || reply === '0') {
                const room = hash.sha1(Date.now()).substring(0, 10);
                client.set('currentRoom', room);
                client.incr(`${room}:numPlayers`);
                client.set(`${room}:player1`, username, () => {
                    printRedis(room, toClient);
                });
            }
            else {
                // Get the number of players in the room
                client.get(`${reply}:numPlayers`, (err, numPlayers) => {
                    // Set next player
                    client.set(`${reply}:player${parseInt(numPlayers) + 1}`, username, () => {
                        printRedis(reply, toClient);
                        if (numPlayers >= 3) {
                            client.del('currentRoom');
                        }
                        else {
                            client.incr(`${reply}:numPlayers`);
                        }
                    });
                })
            }
        });

    });

    // Get game set up
    socket.on('registerGame', (room, playerNum) => {
        // Have first player setup gameroom
        if (playerNum === 1) {
            // Decide who will go first
            const firstPlayer = (Math.floor(Math.random() * 4)) + 1;
            // Set the first player in redis
            client.set(`${room}:turn`, firstPlayer);
            client.set(`${room}:deck`, 'removed');
            client.set(`${room}:chosen`, 'choices:null:null:null:null');
            // Wait for everyone to be connected
            setTimeout(() => {
                // Tell everyone who the first player is
                io.emit(`${room}`, `turn:${firstPlayer}`);
                io.emit(`${room}:${firstPlayer}`, "first:You are the first player!");
            }, 1000);

        }
    });

    // Deal card
    socket.on('deal', (room, playerNum) => {
        // Check if it's actually this player's turn
        client.get(`${room}:turn`, (err, reply) => {
            // If it is the player's turn
            if (reply === `${playerNum}`) {
                // Get a card from the deck
                getCardFromDeck(room, (card) => {
                    console.log(card);

                    // Deal the card to the requester
                    io.emit(`${room}:${playerNum}`, `card:${card}`);

                    // Calculate next player
                    const nextPlayer = (playerNum % 4) + 1;
                    // Store next player
                    client.set(`${room}:turn`, nextPlayer);

                    // Tell everyone who the next player is
                    io.emit(`${room}`, `turn:${nextPlayer}`);
                });
            }
            else {
                // Tell the player that they should wait
                io.emit(`${room}:${playerNum}`, `It's not your turn!`);
            }
        });
    });

    // Choose a card
    socket.on('choose', (room, playerNum, card) => {
        // Get list of chosen cards
        client.get(`${room}:chosen`, (err, reply) => {
            // Separate fields
            let choices = reply.split(':');
            console.log(choices);

            // Correct field for inserting
            const field = playerNum;
            // Insert card
            choices[field] = card;

            // Check if everyone chose a card
            let everyoneChose = true;
            for (let i = 1; i < choices.length; ++i) {
                if (choices[i] === 'null') {
                    everyoneChose = false;
                    break;
                }
            }

            if (everyoneChose) {
                let highest = 0;
                let winner = 0;
                for (let i = 1; i < choices.length; ++i) {
                    heirarchy.forEach((heir, weight) => {
                        if (heir === choices[i] && weight > highest) {
                            highest = weight;
                            winner = i;
                        }
                    });
                }

                client.get(`${room}:player${winner}`, (err, p) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    axios({
                        method: 'post',
                        url: '/winner/',
                        data: {
                            username: p,
                        },
                    })
                        .catch(err => console.log(err));
                });

                io.emit(`${room}`, `won:${winner}`);
            }

            // Re-form string
            let choiceStr = 'choices';
            for (let i = 1; i < choices.length; ++i)
                choiceStr += `:${choices[i]}`;
            console.log(choiceStr);
            // Insert choices back in redis
            client.set(`${room}:chosen`, choiceStr);
            // Return the inserted string to all the cards
            io.emit(`${room}`, `${choiceStr}`);
            // Calculate next player
            const nextPlayer = (playerNum % 4) + 1;
            // Store next player
            client.set(`${room}:turn`, nextPlayer);

            // Tell everyone who the next player is
            io.emit(`${room}`, `turn:${nextPlayer}`);
        })
    })
});

// const port = 4001;
// io.listen(port);
// console.log('listening on port ', port);
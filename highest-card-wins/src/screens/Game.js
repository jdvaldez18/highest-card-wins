import React, { Component } from 'react';
// import io from 'socket.io-client';

//Constants
import screens from '../constants/screenConstants';
import '../styling/GameBoard.css';
import DealButton from '../styling/DealButton.css';

//Redux
import { connect } from "react-redux";

//WebSocket
import io from 'socket.io-client';
import { filter } from 'rsvp';
const socket = io.connect('http://13.57.39.35/', {path: '/ws/'});

const mapStateToProps = state => {
    return {
        username: state.user.username,
        setPage: state.page.setPage,
        room: state.room.room,
        playerNum: state.room.playerNum,
        turn: 0,
    };
};

function loadCards(r) {
    let images = {};
    r.keys().forEach((item, index) => { images[item.replace('./', '')] = r(item); });
    return images;
}

class Game extends Component {
    constructor(props) {
        super(props);

        this.state = {
            room: null,
            players: [],
            message: null,
            card: '',
            cards: [],
            winner: null,
            gameOver: false,
            chosen: [],
        }
    }

    componentWillMount() {
        // 
        const { room, username, playerNum } = this.props;
        let { card, cards, chosen } = this.state;
        // Set up websocket
        socket.emit('registerGame', room, playerNum);

        // Messages an individual player
        socket.on(`${room}:${playerNum}`, (message) => {
            const messageArr = message.split(':');
            if (messageArr[0] === 'first')
                console.log(messageArr[1]);
            if (messageArr[0] === 'card') {
                card = messageArr[1];
                console.log(`Received card: ${messageArr[1]}`);
                cards.push(card);
                this.setState({
                    cards: cards,
                })
            }
            // this.setState({
            //     card: card,
            // })
        });

        // Messages to all users
        socket.on(`${room}`, (message) => {
            const messageArr = message.split(':');

            // Tells if you're first player
            if (messageArr[0] === 'first')
                console.log("First player is " + messageArr[1]);
            // Tells whose turn it is
            if (messageArr[0] === 'turn') {
                console.log(`It is player ${messageArr[1]}'s turn`);
                this.setState({
                    turn: parseInt(messageArr[1]),
                })
            }
            // Tells what choices were made
            if (messageArr[0] === 'choices') {
                console.log(`${messageArr}`);
                var cards = messageArr.slice(1);
                var list = cards.filter(function (value) { return value !== 'null' })
                this.setState({ chosen: list });
            }
            if (messageArr[0] === 'won') {
                console.log(`Player ${messageArr[1]} won!`);
                this.setState({ winner: messageArr[1], gameOver: true });
            }
        })
    }


    deal = () => {
        const { room, playerNum } = this.props;

        socket.emit('deal', room, playerNum);
    }

    choose = (card) => {
        const { room, playerNum } = this.props;
        let { cards } = this.state;
        var newCards = cards.filter(function (cards) {
            return cards !== card;
        });
        socket.emit('choose', room, playerNum, card);

        this.setState({ cards: newCards, });
    }

    playersCards = (num) => {
        const { playerNum } = this.props;
        const { cards, turn } = this.state;
        const images = loadCards(require.context('../PNG', false, /\.(png)$/));
        const backCard = <img style={{ width: '100px', height: '150px' }} src={images['red_back.png']} alt="backCard" />;
        //let dealtCards = [];
        let cardImg;
        if (playerNum === num) {
            cardImg = cards.map((card, i) => {
                // If card at position i is not null
                if (card) {
                    // If it's your turn and you have 3 cards
                    if (turn === playerNum && cards.length === 3) {
                        return (
                            <button onClick={() => this.choose(card)} key={i}>
                                <img style={{ width: '100px', height: '150px' }} src={images[`${card}.png`]} alt='face card' />
                            </button>
                        );
                    }
                    else {
                        return <img style={{ width: '100px', height: '150px' }} src={images[`${card}.png`]} key={i} alt='face card' />;
                    }
                }
                else
                    return null;
            })
        }
        else {
            return backCard;
        }
        return cardImg;
    }
    cardSelected = () => {
        const images = loadCards(require.context('../PNG', false, /\.(png)$/));
        const { chosen } = this.state;
        const backCard = <img style={{ width: '100px', height: '150px' }} src={images['red_back.png']} alt="backCard" />;
        console.log(chosen);
        var cards = []
        if (chosen.length === 4) {
            cards = chosen.map((card) => {
                return <img style={{ width: '100px', height: '150px' }} src={images[`${card}.png`]} alt='face card' />;
            })
        }

        else {
            for (let i = 0; i < chosen.length; ++i) {
                cards.push(backCard);
            }
        }

        return cards;

    }
    playerWon = () => {
        let { gameOver, winner } = this.state;
        const { setPage } = this.props
        if (gameOver) {
            setTimeout(() => {
                setPage(screens.LOGIN);
            }, 5000)
            return (
                <div>
                    <h3>
                        Player {winner}  has won the Game.
                        Returning to Home Screen.
                    </h3>
                </div>
            );
            // Start game after 3 seconds
        }
        else
            return null;

    }
    render() {
        const { username, room, playerNum } = this.props;
        const { turn, cards } = this.state;
        const images = loadCards(require.context('../PNG', false, /\.(png)$/));
        const backCard = <img style={{ width: '100px', height: '150px' }} src={images['red_back.png']} alt="backCard" />;
        let dealButton = null;
        if (turn === playerNum && cards.length < 3)
            dealButton = <button class="deal-button" onClick={this.deal}>Deal</button>;
        // const cardImg = cards.map((card, i) => {
        //     // If card at position i is not null
        //     if (card) {
        //         // If it's your turn and you have 3 cards
        //         if (turn === playerNum && cards.length === 3) {
        //             return (
        //                 <button onClick={() => this.choose(card)} key={i}>
        //                     <img style={{ width: '100px', height: '150px' }} src={images[`${card}.png`]} />
        //                 </button>
        //             );
        //         }
        //         else {
        //             return <img style={{ width: '100px', height: '150px' }} src={images[`${card}.png`]} key={i} />;
        //         }
        //     }
        //     else
        //         return null;
        // })
        const pickACard = (cards.length === 3 && turn === playerNum)
            ? "Pick a card"
            : null;
        return (
            <div>
                {this.playerWon}
                <div>
                    <h1>Welcome to the Game Room!</h1>
                    <br />
                    {username} you are player number: {playerNum}
                    <br />
                    <h4>Room #{room} </h4>
                </div>
                <div>
                    <h4>
                        Player {turn} turn to draw a card.
                    </h4>
                </div>
                <div className="grid">
                    <div className="cell"></div>
                    <div className="cell">
                        <div>
                            Player3
                        </div>
                        <div class="cards">
                            {this.playersCards(3)}
                        </div>
                    </div>
                    <div className="cell"></div>
                    <div className="cell">
                        <div >
                            <div class="cards">
                                {this.playersCards(4)}
                            </div>
                            <div className="horizontalPlayers">
                                Player4
                            </div>
                        </div>
                    </div>
                    <div className="cards">
                        --Deck--
                        <div class="cards">
                            <br />
                            {dealButton}
                            <br />
                            {backCard}
                            <br />
                            {this.playerWon()}

                            <br />
                            <div>
                                {this.cardSelected()}
                            </div>
                        </div>
                    </div>
                    <div className="cell">
                        <div class>
                            <div class="cards">
                                {this.playersCards(2)}
                            </div>
                            <div className="horizontalPlayers">
                                Player2
                            </div>
                        </div>
                    </div>
                    <div className="cellBottom">
                    </div>
                    <div className="cellBottom">
                        <div>
                            Player 1
                        </div>
                        <div class="cards">
                            {this.playersCards(1)}
                        </div>
                        <div className="currentPlayer">
                            <div>
                                {pickACard}
                            </div>
                        </div>
                    </div>
                    <div class="cellBottom">
                    </div>
                </div>

            </div>



        );
    }
}

export default connect(mapStateToProps)(Game);

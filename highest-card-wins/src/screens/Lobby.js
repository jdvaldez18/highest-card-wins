import React, { Component } from 'react';
// import io from 'socket.io-client';

//Constants
import screens from '../constants/screenConstants';

//Redux
import { connect } from "react-redux";
import { setRoom, setPlayerNum } from "../redux/roomActions";

//WebSocket
import io from 'socket.io-client';
import 'tachyons';
import '../styling/Lobby.css';
const socket = io.connect('http://13.57.39.35/', {path: '/ws/'});



const mapStateToProps = state => {
    return {
        token: state.user.token,
        username: state.user.username,
        setPage: state.page.setPage,
        room: state.room.room,
    };
};

function mapDispatchToProps(dispatch) {
    return {
        setRoom: (room) => dispatch(setRoom(room)),
        setPlayerNum: (playerNum) => dispatch(setPlayerNum(playerNum)),
    };
}

class Lobby extends Component {
    constructor(props) {
        super(props);

        this.state = {
            players: [],
            message: null,
        }
    }

    componentWillMount() {
        const { setPage, setRoom, setPlayerNum, username } = this.props;

        // Set up websocket
        socket.emit('register', username, (p) => {

            // Set the room in Redux
            setRoom(p.room);

            // Listen for websocket messages to the room number
            socket.on(p.room, (p) => {
                this.setState({
                    players: p.players,
                });

                // Check if the room is full yet
                let fullRoom = true;
                p.players.forEach((player, i) => {
                    if (!player) fullRoom = false;
                    if (player === username) setPlayerNum(i + 1);
                })
                // Announce starting game
                if (fullRoom === true) {
                    this.setState({
                        message: "Game starting...",
                    })
                    // Start game after 3 seconds
                    setTimeout(() => {
                        console.log("Going to next room.");
                        setPage(screens.GAME);
                    }, 3000)
                }
            })
        });
    }

    render() {
        const { players } = this.state;
        const { setPage, room, username } = this.props;

        const playerDivs = players.map((player, i) => {
            return (
                <div key={i}>
                    {i + 1}. {player}
                </div>
            );
        })

        return (
            <div className='lobbytest'>
            <br /><br />
            
            
                <div className='sizetype'>
                <div className='oneside'>
                   <b> Username:</b> {username} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    
                   <b>Room to join:</b>  {room}
                    <br></br>
                </div>
                <h1 className='fonthead'>Players waiting to start the game</h1>
                {/* <div><h2 className='styling'>Connecting you to other geeks</h2> </div> */}
                <br></br>
                <div className="bordercontrol">
                <b>Hey, </b> {username}! <b>Connecting you to other geeks:</b>
                <br />
                    {playerDivs}
                    <h2>{this.state.message}</h2>
                </div>
                
                <a href="#" onClick={() => setPage(screens.LOGIN)}>Go Back</a>
            </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Lobby);

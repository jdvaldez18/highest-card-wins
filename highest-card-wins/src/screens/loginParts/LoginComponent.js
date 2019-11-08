import React, { Component } from 'react';
import axios from 'axios';

//Constants
import screens from '../../constants/screenConstants';

//Redux
import { connect } from "react-redux";
import { setUsername, setToken } from "../../redux/userActions";

// MaterialUI
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import { green800, green900 } from 'material-ui/styles/colors';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

const mapStateToProps = state => {
    return {
        token: state.user.token,
        username: state.user.username,
        setPage: state.page.setPage,
    };
};

function mapDispatchToProps(dispatch) {
    return {
        setToken: (token) => dispatch(setToken(token)),
        setUsername: (username) => dispatch(setUsername(username)),
    };
}

class LoginComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: ''
        }

    }

    handleClick = (e) => {
        const { username, password } = this.state;
        const { setToken, setUsername, setPage } = this.props;

        axios.post('/users/login', {
            username: username,
            password: password,
        })
            .then(result => result.data)
            .then(token => {
                // Store this in redux
                setToken(token);
                setUsername(username);

                console.log(this.props.token);
                console.log(this.props.username);

                // Go to lobby
                setPage(screens.LOBBY);
            })
            .catch(err => {
                console.log('User not found');
            });
    }

    render() {

        const muiTheme = getMuiTheme({
            palette: {
                primary1Color: green800,
                accent1Color: green900
            }
        });

        const style = {
            margin: 15,
        };

        return (
            <div >
                <MuiThemeProvider muiTheme={muiTheme}>

                    <div>
                        <AppBar
                            title="Login"
                        />
                        <TextField
                            hintText="Enter your Username"
                            floatingLabelText="Username"
                            onChange={(event, newValue) =>
                                this.setState({ username: newValue })}
                        />
                        <br />
                        <TextField
                            type="password"
                            hintText="Enter your Password"
                            floatingLabelText="Password"
                            onChange={(event, newValue) =>
                                this.setState({ password: newValue })}
                        />
                        <br />
                        <RaisedButton
                            label="Login"
                            primary={true}
                            style={style}
                            onClick={this.handleClick}
                        />
                    </div>

                </MuiThemeProvider>

            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginComponent);
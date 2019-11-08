import React, { Component } from 'react';
import axios from 'axios';

// MaterialUI
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import { green800, green900 } from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';


class RegisterComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            message: '',
        }
    }

    handleClick = (e) => {
        const { username, password } = this.state;
        const { setPage } = this.props;

        axios.post('/users/register', {
            username: username,
            password: password,
        })
            .then(result => {
                console.log(result.data);
                this.setState({
                    message: 'User added!',
                })
            })
            .catch(err => {
                console.log('Username already taken');
                console.log(err)
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
                            title="Register"
                        />
                        <TextField
                            type="username"
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
                            label="Submit"
                            primary={true}
                            style={style}
                            onClick={this.handleClick} />
                        <br />
                        <span style={{ color: 'red' }}>{this.state.message}</span>
                        <br />
                    </div>
                </MuiThemeProvider>
            </div>
        );
    }
}

export default RegisterComponent;
import React, { Component } from 'react';
import axios from 'axios';

//Constants
import screens from '../constants/screenConstants';

import '../styling/scores.css'
//Components
import LoginComponent from './loginParts/LoginComponent';
import RegisterComponent from './loginParts/RegisterComponent';

//MaterialUI
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import { green800, green900 } from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';


class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginscreen: [],
      message: '',
      buttonLabel: 'Register',
      isLogin: true,
      users: [],
    }
  }
  componentWillMount() {
    var loginscreen = [];
    loginscreen.push(<LoginComponent parentContext={this} appContext={this.props.parentContext} />);
    var message = "No account? Sign up";
    this.setState({
      loginscreen: loginscreen,
      message: message
    })

    axios.get('/users/scores')
      .then(result => result.data)
      .then(users => {
        this.setState({
          users: users,
        })
      })
  }

  handleClick = (e) => {

    let message;
    if (this.state.isLogin) {
      let loginscreen = [];
      loginscreen.push(<RegisterComponent parentContext={this} />);
      message = "Already registered? Click Login";
      this.setState({
        loginscreen: loginscreen,
        message: message,
        buttonLabel: "Login",
        isLogin: false
      })
    }
    else {
      let loginscreen = [];
      loginscreen.push(<LoginComponent parentContext={this} />);
      message = "Not a registered user? Go to registration";
      this.setState({
        loginscreen: loginscreen,
        message: message,
        buttonLabel: "Register",
        isLogin: true
      });
    }
  }

  render() {

    const { users } = this.state;

    const muiTheme = getMuiTheme({
      palette: {
        primary1Color: green800,
        accent1Color: green900
      }
    });

    const style = {
      margin: 15,
    };

    const userList = users.map(user => {
      return (
        <tr>
          <td>{user.username}</td>
          <td>{user.score}</td>
        </tr>
      );
    })

    return (

      <div class="container">

        <div class="split left">
          <table id="scores">
            <caption> <b> Top Scores</b></caption>
            <tr>
              <th>Player</th>
              <th>Score </th>
            </tr>
            {/* <tr>
              <td>Player 1</td>
              <td>3</td>
            </tr>
            <tr>
              <td>Player 2</td>
              <td>2</td>
            </tr>
            <tr>
              <td>Player 3</td>
              <td>1</td>
            </tr> */}
            {userList}
          </table>

        </div>

        <div class="split right">
          <div className="loginscreen">
            {this.state.loginscreen}
            <div>
              {this.state.message}
              <MuiThemeProvider muiTheme={muiTheme}>
                <div>
                  <RaisedButton label={this.state.buttonLabel} primary={true}
                    style={style} onClick={this.handleClick} />
                </div>
              </MuiThemeProvider>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
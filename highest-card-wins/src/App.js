import React, { Component } from 'react';
import './App.css';
import Login from './screens/Login';
import Lobby from './screens/Lobby';
import Game from './screens/Game';

import { connect } from "react-redux";
import { setSetPage } from "./redux/pageActions";

const mapStateToProps = state => {
  return {
    setPage: state.page.setPage,
  };
};

function mapDispatchToProps(dispatch) {
  return {
    setSetPage: (setPage) => dispatch(setSetPage(setPage)),
  };
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // List of pages in app
      pages: [
        <Login
          parentContext={this}
        />,
        <Lobby
          parentContext={this}
        />,
        <Game
          parentContext={this}
        />,
      ],
      // Current displayed page
      currentPage: null,
    }
  }

  componentWillMount() {
    const { pages } = this.state;

    // Start on first page in queue
    this.setState({
      currentPage: pages[0],
    });

    this.props.setSetPage(this.setPage);
  }

  // Changes pages
  setPage = (page) => {
    let { pages } = this.state;

    this.setState({
      currentPage: pages[page],
    })
  }

  render() {
    return (
      <div className="App">
        {this.state.currentPage}
      </div>
    );
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(App);

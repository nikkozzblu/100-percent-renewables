import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import logo from './logo1.svg';
import circle from './circle.svg';
import background from './background.png';
import './App.css';
import { Calculator } from './Calculator';
import { About } from './pages';

class App extends Component {

  render() {
    return (
      <div className="App">
        <img src={background} className="App-background"></img>
        <div className="App-header">
          <div className="App-logo-holder">
            <img src={logo} className="App-logo" alt="logo" />
            <img src={circle} className="App-logo circle" alt="logo" />
          </div>
          <div className="App-name">
            <h2>Welcome to Wattif</h2>
            <div className="small-text">Electrical energy policies explorer</div>
          </div>
        </div>
        <div className="AppContainer">
          <Router>
            <Route exact path="/" component={Calculator} />
            <Route path="/about" component={About} />

          </Router>
        </div>
        <div className="App-footer">
          <a href="/about">About whatif ?</a>
          <p>This is an open-source project, to collaborate visit : <a href="https://github.com/nikkozzblu/100-percent-renewables" target="_blank">our GitHub</a></p>
        </div>
      </div>
    );
  }
}

export default App;

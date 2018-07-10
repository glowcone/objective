import React, { Component } from 'react';
import ChartistGraph from 'react-chartist';
import './css/chartist.min.css';
import './App.css';
import notifSound from './sounds/notif.mp3';

class App extends Component {
  constructor(props) {
    super(props);

    this.chartOptions = {
      high: 100,
      low: 0,
      stretch: true
    }
    this.notif = new Audio(notifSound);
    this.oldScore = localStorage.getItem('score');
    if (this.oldScore) {
      this.oldScore = this.oldScore.split(",");
    } else {
      this.oldScore = [];
    }
    this.state = {
      paused: true,
      interval: 10*60,
      timeLeft: 10*60,
      objective: "",
      distractions: "",
      history: []
    }
  }

  onChangeDistractions = (e) => {
    localStorage.setItem('distractions', e.target.value);
    this.setState({ distractions: e.target.value });
  }

  onChangeObjective = (e) => {
    this.setState({ objective: e.target.value });
  }

  onChangeInterval = (e) => {
    const secs = parseInt(e.target.value) * 60;
    if (this.state.timeLeft == this.state.interval) {
      this.setState({ timeLeft: secs });
    }
    this.setState({ interval: secs });
  }

  onClickTimer = (e) => {
    if (!this.state.paused) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
    this.setState({ paused: !this.state.paused });
  }

  onClickHistory = (i) => {
    const histCopy = this.state.history;
    histCopy[i].done = !histCopy[i].done;
    this.setState({
      history: histCopy
    }, () => {
      localStorage.setItem('score', [...this.oldScore, this.getScore()])
    })
  }

  getScore = () => {
    const score = this.state.history.filter(h => h.done).length / this.state.history.length * 100
    if (isNaN(score))
      return "No score yet"
    return score
  }

  getTimerText = () => {
    var date = new Date(null);
    date.setSeconds(this.state.timeLeft);
    return date.toISOString().substr(11, 8);
  }

  nextRound = () => {
    this.setState({
      timeLeft: this.state.interval,
      objective: "",
      history: [{objective: this.state.objective, done: false}, ...this.state.history]
    }, () => {
      localStorage.setItem('score', [...this.oldScore, this.getScore()])
    });
    this.notif.play();
  }

  startTimer = () =>{
    this.timerId = setInterval(()=>{
      if (this.state.timeLeft <= 1) {
        this.nextRound();
      } else {
        this.setState({ timeLeft: this.state.timeLeft - 1 })
      }
    }, 1000);
  }

  stopTimer = () =>{
    clearInterval(this.timerId);
  }

  componentDidMount() {
    const temp = localStorage.getItem('distractions')
    if (temp) {
      this.setState({ distractions: temp })
    }
  }

  render() {
    return (
      <div className="App">
          <div className="row">
            <div className="three columns sidebar">
              <ChartistGraph data={{series: [[...this.oldScore, this.getScore()]]}} options={this.chartOptions} type={'Line'}/>
              <p className="score">Productivity: {this.getScore()}</p>
              {this.state.history.map((h, i) => (
                <div className="history" onClick={() => this.onClickHistory(i)} key={i}>
                  <span>{(this.state.history.length - i) + ": " + h.objective}</span>
                  <span>{" - " + (h.done ? "done" : "not done")}</span>
                </div>
              ))}
            </div>
            <div className="six columns main">
              <label>
                <span>Objective: </span>
                <input className="u-full-width objective" type="text" onChange={this.onChangeObjective} value={this.state.objective}/>
              </label>
              <p className="timer" style={{color: this.state.paused ? "rgb(209, 209, 209)" : "black"}} onClick={this.onClickTimer}>{this.getTimerText()}</p>
              <div className="settings">
                <label>
                  <span>Interval: </span>
                  <input type="number" onBlur={this.onChangeInterval} defaultValue={this.state.interval / 60}/>
                </label>
              </div>
            </div>
            <div className="three columns sidebar">
              <textarea className="distractions" onChange={this.onChangeDistractions} value={this.state.distractions}></textarea>
            </div>
          </div>
      </div>
    );
  }
}

export default App;

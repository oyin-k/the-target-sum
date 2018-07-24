import React, { Component, PureComponent } from 'react';
import './App.css';
import sampleSize from 'lodash/sampleSize';

//TODO: gif of game played

// TODO: scoreboard

const randomNumberBetween = (min, max) => 
   Math.floor(Math.random() * (max - min + 1) ) + min;


class Number extends PureComponent {
  handleClick = () => {
    if (this.props.clickable) {
      this.props.onClick(this.props.id);
    }
  };

  render () {
    const {clickable, value} = this.props;
    return (
      <div 
        className="number" 
        style={ {opacity: clickable ? 1 : 0.3 } }
        onClick={this.handleClick}>
        {value}
      </div>
    )
  }
}

class Game extends Component {

  state = {
    gameStatus: 'new', 
    remainingSeconds: this.props.initialSeconds,
    selectedIds: []
  }

  static bgColors = {
    playing: '#ccc',
    won: 'green',
    lost: 'red',
  };

  challengeNumbers = Array
    .from({ length: this.props.challengeSize })
    .map( () => randomNumberBetween(...this.props.challengeRange) );

  target = sampleSize(
    this.challengeNumbers,
    this.props.challengeSize - 2
  ).reduce((acc, curr) => acc + curr, 0);
  
  isNumberAvailable = (numberIndex) => 
    this.state.selectedIds.indexOf(numberIndex) === -1;

  startGame = () => {
    this.setState({gameStatus: 'playing'}, () => {
      this.intervalId = setInterval(() => {
        this.setState((prevState) => {
          const newRemainingSeconds = prevState.remainingSeconds - 1;
          if (newRemainingSeconds === 0) {
            clearInterval(this.intervalId);
            return { gameStatus: 'lost', remainingSeconds: 0 };
          }
          return { remainingSeconds: newRemainingSeconds };
        });
      }, 1000);
    });
  };

  selectNumber = (numberIndex) => {
    if (this.state.gameStatus !== 'playing') {
      return;
    }
    this.setState(
        (prevState) => ({
          selectedIds: [...prevState.selectedIds, numberIndex],
          gameStatus: this.calcGameStatus([
            ...prevState.selectedIds, 
            numberIndex
        ])
      }),
      () => {
        if (this.state.gameStatus !== 'playing') {
          clearInterval(this.intervalId);
        }
      }
    );
  };

  calcGameStatus = (selectedIds) => {
    const sumSelected = selectedIds.reduce(
      (acc, curr) => acc + this.challengeNumbers[curr], 
      0);
      if (sumSelected < this.target) {
        return 'playing';
      }
      return sumSelected === this.target ? 'won' : 'lost';
  };

  componentDidMount() {
    if (this.props.autoPlay) {
      this.startGame();
    }
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render () {
    const {gameStatus, remainingSeconds} = this.state; 
    const {onPlayAgain} = this.props;
    return (
      <div className="game">
        <div className="playground">
          <div className="help">
            Pick 4 numbers that sum up to the target in 10 seconds
          </div>
          <div 
            className="target" 
            style={ {backgroundColor: Game.bgColors[gameStatus]} } >
            {gameStatus === 'new' ? '?' : this.target}
          </div>
          <div className="challenge-numbers">
            {this.challengeNumbers.map((value, index) => (
              <Number 
                key={index} 
                value={gameStatus === 'new' ? '?' : value}
                id={index}
                clickable={this.isNumberAvailable(index)}
                onClick={this.selectNumber} /> 
            ))}
          </div>
          <div className="footer">
            {gameStatus === 'new' ? (
              <button className="button" onClick={this.startGame}>Start</button>
            ) : (
              <div className="timer-value">{remainingSeconds}</div>
            )}
            {['won', 'lost'].includes(gameStatus) && (
              <button className="button" onClick={onPlayAgain}>Play again</button>
            )} 
          </div>
        </div>
        

        <ScoreBoard />
      </div>
    )
  }
}

class ScoreBoard extends Component {
  render () {
    return (
      <div className="scoreboard">
        <table>
          <thead>
            <tr>
              <th>Attempts</th>
              <th>Wins</th>
              <th>Score</th>
            </tr>
          </thead>      
          <tbody>
            <tr>
              <td>20</td>
              <td>15</td>
              <td>56</td>
            </tr>  
          </tbody>         
        </table>
      </div>
    )
  }
}

class App extends Component {

  state = {
    gameId: 1
  }

  resetGame = () => 
    this.setState(
      (prevState) => ({
        gameId: prevState.gameId + 1
      }));
  

  render () {
    const {gameId} = this.state;
    return (
        <Game 
        key={gameId}
        autoPlay={gameId > 1}
        challengeSize={6} 
        challengeRange={[2, 9]} 
        initialSeconds={10}
        onPlayAgain={this.resetGame} 
        />
    )
  }
}

export default App;

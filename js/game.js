const SERVICE_TIMES = 2; //How many services to switch
const MATCH_POINT = 11; //How many points to win a round
const TOTAL_MATCH = 5; //How many round in total to play
const SWITCH_POINT_FOR_FINAL = 5; //-1 means never sitch position on last match

class Game {
  constructor(serviceSide) {
    this.playerA = new Player({
      service: serviceSide === 'playerA' ? SERVICE_TIMES : 0,
      serviceTimes: SERVICE_TIMES,
    });
    this.playerB = new Player({
      service: serviceSide === 'playerB' ? SERVICE_TIMES : 0,
      serviceTimes: SERVICE_TIMES,
    });
    this.positionIsSwitched = undefined;
    this.reversible = {
      currentRound: 1,
      initialService: serviceSide,
      isDeuceTrigered: false,
      finalRoundSwitched: false,
      gameStatus: 'Started',
      statusInfo: '0:0',
      shouldDeliverStatusBoard: false,
    };
    this.history = [
      {
        a: Object.assign({}, this.playerA),
        b: Object.assign({}, this.playerB),
        reversible: Object.assign({}, this.reversible),
        switched: false,
      },
    ];
  }

  setShouldDeliverStatusBoard(shouldDeliverStatusBoard) {
    this.reversible.shouldDeliverStatusBoard = shouldDeliverStatusBoard;
  }

  setGameStatus(status) {
    this.reversible.gameStatus = status;
    this.setShouldDeliverStatusBoard(true);
  }

  updateGameStatus() {
    if (this.reversible.gameStatus === 'Pause') {
      this.reversible.gameStatus = 'Started';
    } else if (this.reversible.gameStatus === 'Game') {
      this.checkMatch(true);
    } else if (this.reversible.gameStatus === 'Game Over!') {
      delete this;
    }
  }

  hitPoint(player) {
    if (player === 'playerA') {
      this.playerA.hitPoint();
    } else if (player === 'playerB') {
      this.playerB.hitPoint();
    } else {
      throw new Error(`Unknown player of ${player}`);
    }
    this.handleDeuce();
    this.updateService();
    const positionJustSwitched = this.checkMatch();
    this.reversible.statusInfo = this.positionIsSwitched
      ? `${this.playerB.score} : ${this.playerA.score}`
      : `${this.playerA.score} : ${this.playerB.score}`;
    this.history.push({
      a: Object.assign({}, this.playerA),
      b: Object.assign({}, this.playerB),
      reversible: Object.assign({}, this.reversible),
      switched: positionJustSwitched,
    });
  }

  reverse() {
    if (this.history.length > 1) {
      const currentState = this.history.pop();
      const previousState = this.history[this.history.length - 1];
      this.playerA = new Player(previousState.a);
      this.playerB = new Player(previousState.b);
      this.reversible = Object.assign({}, previousState.reversible);
      this.playerA.setShouldAnimateBall(false);
      this.playerB.setShouldAnimateBall(false);
      if (currentState.switched) {
        this.switchPosition();
      }
    }
  }

  handleDeuce() {
    const { playerA, playerB } = this;
    if (
      playerA.score === MATCH_POINT - 1 &&
      playerB.score === MATCH_POINT - 1
    ) {
      this.reversible.isDeuceTrigered = true;
    }
  }

  checkMatch(startNext) {
    const { playerA, playerB } = this;
    if (playerA.score >= MATCH_POINT && !this.reversible.isDeuceTrigered) {
      return this.matchDone(playerA, playerB, startNext);
    }
    if (playerB.score >= MATCH_POINT && !this.reversible.isDeuceTrigered) {
      return this.matchDone(playerB, playerA, startNext);
    }
    if (this.reversible.isDeuceTrigered && playerA.score - playerB.score >= 2) {
      return this.matchDone(playerA, playerB, startNext);
    }
    if (this.reversible.isDeuceTrigered && playerB.score - playerA.score >= 2) {
      return this.matchDone(playerB, playerA, startNext);
    }
    if (
      this.reversible.currentRound === TOTAL_MATCH &&
      !this.reversible.finalRoundSwitched &&
      (playerA.score === SWITCH_POINT_FOR_FINAL ||
        playerB.score === SWITCH_POINT_FOR_FINAL)
    ) {
      this.switchPosition();
      this.reversible.finalRoundSwitched = true;
      return true;
    }
    return false;
  }

  matchDone(winner, losser, startNext) {
    if (startNext) {
      this.startNextRound(winner, losser);
      return true;
    }
    this.reversible.gameStatus = 'Game';
    this.reversible.shouldDeliverStatusBoard = true;
    return true;
  }

  startNextRound(winner, losser) {
    this.reversible.gameStatus = 'Started';
    this.reversible.shouldDeliverStatusBoard = false;
    this.reversible.currentRound = this.reversible.currentRound + 1;
    this.reversible.isDeuceTrigered = false;
    winner.winMatch(this.reversible.currentRound);
    losser.lossMatch(this.reversible.currentRound);
    if (this.gameIsOver()) {
      this.setGameStatus('Game Over!');
      this.reversible.statusInfo = this.positionIsSwitched
        ? `${this.playerB.match} : ${this.playerA.match}`
        : `${this.playerA.match} : ${this.playerB.match}`;
      return false;
    }
    this.switchPosition();
  }

  gameIsOver() {
    return (
      this.playerA.match >= TOTAL_MATCH / 2 ||
      this.playerB.match >= TOTAL_MATCH / 2
    );
  }

  updateService() {
    let serviceRemain;
    let nextService;
    if (this.playerA.service > 0) {
      nextService = 'playerB';
      serviceRemain = this.playerA.consumeService();
    }
    if (this.playerB.service > 0) {
      nextService = 'playerA';
      serviceRemain = this.playerB.consumeService();
    }
    if (serviceRemain === 0) {
      this[nextService].serviceChange(
        this.reversible.isDeuceTrigered ? 1 : SERVICE_TIMES
      );
    }
  }

  switchPosition() {
    this.positionIsSwitched = !this.positionIsSwitched;
  }
}

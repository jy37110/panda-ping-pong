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
      gameStatus: 'Pause',
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

  hitPoint(player) {
    if (player === 'playerA') {
      this.playerA.hitPoint();
    } else if (player === 'playerB') {
      this.playerB.hitPoint();
    } else {
      throw new Error(`Unknown player of ${player}`);
    }
    this.updateService();
    const positionJustSwitched = this.checkMatch();
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
      if (currentState.switched) {
        this.switchPosition();
      }
    }
  }

  checkMatch() {
    const { playerA, playerB } = this;
    if (
      playerA.score === MATCH_POINT - 1 &&
      playerB.score === MATCH_POINT - 1
    ) {
      this.reversible.isDeuceTrigered = true;
    }
    if (playerA.score >= MATCH_POINT && !this.reversible.isDeuceTrigered) {
      return this.matchDone(playerA, playerB);
    }
    if (playerB.score >= MATCH_POINT && !this.reversible.isDeuceTrigered) {
      return this.matchDone(playerB, playerA);
    }
    if (this.reversible.isDeuceTrigered && playerA.score - playerB.score >= 2) {
      return this.matchDone(playerA, playerB);
    }
    if (this.reversible.isDeuceTrigered && playerB.score - playerA.score >= 2) {
      return this.matchDone(playerB, playerA);
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

  matchDone(winner, losser) {
    this.reversible.currentRound = this.reversible.currentRound + 1;
    this.reversible.isDeuceTrigered = false;
    winner.winMatch(this.reversible.currentRound);
    losser.lossMatch(this.reversible.currentRound);
    if (this.gameIsOver()) {
      this.reversible.gameStatus = 'Game Over!';
      return false;
    }
    this.switchPosition();
    return true;
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

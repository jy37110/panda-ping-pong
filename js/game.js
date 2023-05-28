const SERVICE_TIMES = 2;
const MATCH_POINT = 11;
const TOTAL_MATCH = 5;
const SWITCH_POINT_FOR_FINAL = 5;

class Game {
  constructor(serviceSide) {
    this.playerA = new Player(
      serviceSide === 'playerA' ? SERVICE_TIMES : 0,
      SERVICE_TIMES
    );
    this.playerB = new Player(
      serviceSide === 'playerB' ? SERVICE_TIMES : 0,
      SERVICE_TIMES
    );
    this.currentRound = 1;
    this.history = [];
    this.initialService = serviceSide;
    this.isDeuceTrigered = false;
    this.positionIsSwitched = undefined;
    this.finalRoundSwitched = false;
  }

  hitPoint(player) {
    this.history.push(player);
    if (player === 'playerA') {
      this.playerA.hitPoint();
    } else if (player === 'playerB') {
      this.playerB.hitPoint();
    } else {
      throw new Error(`Unknown player of ${player}`);
    }
    this.updateService();
    return this.checkMatch();
  }

  checkMatch() {
    const { playerA, playerB } = this;
    if (
      playerA.scroe === MATCH_POINT - 1 &&
      playerB.scroe === MATCH_POINT - 1
    ) {
      this.isDeuceTrigered = true;
    }
    if (playerA.scroe >= MATCH_POINT && !this.isDeuceTrigered) {
      this.matchDone(playerA, playerB);
      return true;
    }
    if (playerB.scroe >= MATCH_POINT && !this.isDeuceTrigered) {
      this.matchDone(playerB, playerA);
      return true;
    }
    if (this.isDeuceTrigered && playerA.scroe - playerB.scroe >= 2) {
      this.matchDone(playerA, playerB);
      return true;
    }
    if (this.isDeuceTrigered && playerB.scroe - playerA.scroe >= 2) {
      this.matchDone(playerB, playerA);
      return true;
    }
    if (
      this.currentRound === TOTAL_MATCH &&
      !this.finalRoundSwitched &&
      (playerA.scroe === SWITCH_POINT_FOR_FINAL ||
        playerB.scroe === SWITCH_POINT_FOR_FINAL)
    ) {
      this.switchPosition();
      this.finalRoundSwitched = true;
    }
    return false;
  }

  matchDone(winner, losser) {
    this.currentRound = this.currentRound + 1;
    winner.winMatch(this.currentRound);
    losser.lossMatch(this.currentRound);
    this.switchPosition();
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
      this[nextService].serviceChange(this.isDeuceTrigered ? 1 : SERVICE_TIMES);
    }
  }

  switchPosition() {
    this.positionIsSwitched = !this.positionIsSwitched;
  }
}

class Player {
  constructor(option) {
    this.score = option.score ?? 0;
    this.match = option.match ?? 0;
    this.service = option.service;
    this.initalService = option.service !== 0;
    this.serviceTimes = option.serviceTimes;
    this.shouldAnimateBall = true;
  }

  hitPoint() {
    this.score++;
  }

  setShouldAnimateBall(shouldAnimateBall) {
    this.shouldAnimateBall = shouldAnimateBall;
  }

  consumeService() {
    this.service = this.service - 1 > 0 ? this.service - 1 : 0;
    this.shouldAnimateBall = false;
    return this.service;
  }

  serviceChange(times) {
    this.shouldAnimateBall = true;
    this.service = times;
  }

  winMatch(nextRound) {
    this.score = 0;
    this.match++;
    this.setServiceForNextRound(nextRound);
  }

  lossMatch(nextRound) {
    this.score = 0;
    this.setServiceForNextRound(nextRound);
  }

  setServiceForNextRound(round) {
    if (this.initalService) {
      this.service = round % 2 === 0 ? 0 : this.serviceTimes;
    } else {
      this.service = round % 2 === 0 ? this.serviceTimes : 0;
    }
    this.shouldAnimateBall = true;
  }
}

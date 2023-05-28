class Player {
  constructor(service, serviceTimes) {
    this.scroe = 0;
    this.match = 0;
    this.service = service;
    this.initalService = service !== 0;
    this.serviceTimes = serviceTimes;
  }

  hitPoint() {
    this.scroe++;
  }

  consumeService() {
    this.service = this.service - 1 > 0 ? this.service - 1 : 0;
    return this.service;
  }

  serviceChange(times) {
    this.service = times;
  }

  winMatch(nextRound) {
    this.scroe = 0;
    this.match++;
    this.setServiceForNextRound(nextRound);
  }

  lossMatch(nextRound) {
    this.scroe = 0;
    this.setServiceForNextRound(nextRound);
  }

  setServiceForNextRound(round) {
    if (this.initalService) {
      this.service = round % 2 === 0 ? 0 : this.serviceTimes;
    } else {
      console.log(round, this.serviceTimes);
      this.service = round % 2 === 0 ? this.serviceTimes : 0;
    }
  }
}

     // let random = new Sim.Random(SEED);
     let day = new Sim.Event("Day");
     let studyStartVisit = new Sim.Event("Visit");
     let completedVisits = [];
     const visits = [
       { name: 'Visit 1', day: 7, repetitions: 0, minWindow: 0, maxWindow: 0, dependency: null },
       { name: 'Visit 2', day: 10, repetitions: 2, minWindow: 2, maxWindow: 4, dependency: null },
       { name: 'Visit 3', day: null, repetitions: 0, minWindow: 2, maxWindow: 2, dependency: 'Visit 2' }
       // Add more visits as needed
     ];
    
   export class Schedule extends Sim.Entity {
      start() {
        this.visitsIndex = 0;
        this.scheduleVisit(studyStartVisit, visits[this.visitsIndex]);
      }
      scheduleVisit(visit) {
        if (this.visitsIndex > 0) {
          this.sim.log('Finished Visit: ' + this.visitsIndex.toFixed(0));
          // First visit isn't in the visits array
          completedVisits.push(visits[this.visitsIndex - 1]);
        }
        this.sim.log('completedVisits len: ' + completedVisits.length);
        if (this.visitsIndex >= visits.length) {
          this.sim.log('Study Complete');
        } else {
          this.sim.log('Scheduling Visit: ' + (this.visitsIndex+1).toFixed(0));
          let visitEvent = new Sim.Event(visits[this.visitsIndex].name);
          let daysToWait = visits[this.visitsIndex].day;
          if (daysToWait === null) {
            if (visits[this.visitsIndex].dependency) {
              this.sim.log('Dependency: ' + visits[this.visitsIndex].dependency);
              this.sim.log('# Completed Visits: ' + completedVisits.length);
              this.sim.log('Last Completed Visit: ' + completedVisits[completedVisits.length - 1].name);
              let dependency = completedVisits.find(v => v.name === visits[this.visitsIndex].dependency);
              this.sim.log('Dependency on: ' + dependency.name);
              daysToWait = 1;
            }
          }
          this.setTimer(daysToWait).done(this.scheduleVisit, this, [visits[this.visitsIndex]]);
          this.visitsIndex++;
        }
      }
    }
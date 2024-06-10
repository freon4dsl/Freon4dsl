
   export class Schedule extends Sim.Entity {
    static day = new Sim.Event("Day");
    static studyStartVisit = new Sim.Event("Visit");
    static completedVisits = [];
    static visits = [
     //  { name: 'Visit 1', day: 7, repetitions: 0, minWindow: 0, maxWindow: 0, dependency: null },
     //  { name: 'Visit 2', day: 10, repetitions: 2, minWindow: 2, maxWindow: 4, dependency: null },
     //  { name: 'Visit 3', day: null, repetitions: 0, minWindow: 2, maxWindow: 2, dependency: 'Visit 2' }
     //  // Add more visits as needed
    ];
      
      start() {
        this.visitsIndex = 0;
        this.scheduleVisit(Schedule.studyStartVisit, Schedule.visits[this.visitsIndex]);
      }

      static setVisits(visits) {
        Schedule.visits = visits;
      }

      scheduleVisit(visit) {
        if (this.visitsIndex > 0) {
          this.sim.log('Finished Visit: ' + this.visitsIndex.toFixed(0));
          // First visit isn't in the visits array
          Schedule.completedVisits.push(Schedule.visits[this.visitsIndex - 1]);
        }
        this.sim.log('completedVisits len: ' + Schedule.completedVisits.length);
        if (this.visitsIndex >= Schedule.visits.length) {
          this.sim.log('Study Complete');
        } else {
          this.sim.log('Scheduling Visit: ' + (this.visitsIndex+1).toFixed(0));
          let visitEvent = new Sim.Event(Schedule.visits[this.visitsIndex].name);
          let daysToWait = Schedule.visits[this.visitsIndex].day;
          if (daysToWait === null) {
            if (Schedule.visits[this.visitsIndex].dependency) {
              this.sim.log('Dependency: ' + Schedule.visits[this.visitsIndex].dependency);
              this.sim.log('# Completed Visits: ' + Schedule.completedVisits.length);
              this.sim.log('Last Completed Visit: ' + Schedule.completedVisits[Schedule.completedVisits.length - 1].name);
              let dependency = Schedule.completedVisits.find(v => v.name === Schedule.visits[this.visitsIndex].dependency);
              this.sim.log('Dependency on: ' + dependency.name);
              daysToWait = 1;
            }
          }
          this.setTimer(daysToWait).done(this.scheduleVisit, this, [Schedule.visits[this.visitsIndex]]);
          this.visitsIndex++;
        }
      }
    }
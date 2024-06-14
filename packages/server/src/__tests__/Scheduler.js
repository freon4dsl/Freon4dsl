
   /*
    * The Scheduler is based on code copied from on simjs.updated (https://github.com/btelles/simjs-updated) and is used to run the simulations.
    *
    * The Events and Timeline are based on TypeScript classes so they are created externally and passed in to the this.
    */
  export class Scheduler extends Sim.Entity {
    day = new Sim.Event("Day");
    studyEvent = new Sim.Event("Visit");
    completedEvents = [];
    events;
    timeline;
    simulation;
      
    start(...args) {
      console.log('Scheduler Start args length:'+ args.length);
      this.simulation = args[0];
      //TODO: switch to not having events and timelines as variables and just use the simulation object.
      this.events = this.simulation.getEvents();
      this.timeline = this.simulation.getTimeline();
      this.eventsIndex = 0;
      this.scheduleVisit(this.studyEvent, this.simulation.getFirstEvent());
    }

    scheduleVisit(visit) {
      console.log('Scheduling Visit where eventsIndex is:' + this.eventsIndex);
      if (this.eventsIndex > 0) {
        console.log('Finished Visit: ' + this.eventsIndex.toFixed(0));
        // First visit isn't in the events array
        this.completedEvents.push(this.events[this.eventsIndex - 1]);
      }
      console.log('completedEvents len: ' + this.completedEvents.length);
      if (this.eventsIndex >= this.events.length) {
        console.log('Study Complete');
      } else {
        let currentEvent = this.events[this.eventsIndex];
        console.log('Scheduling Visit: ' + (this.eventsIndex+1).toFixed(0));  // +1 because we are 0 indexed but what to display as a 1-based visit number
        console.log('Adding to Timeline Event Name: ' + currentEvent.name() + ' on Day: ' + currentEvent.day());
        this.timeline.addEvent(this.timeline.newEventInstance(currentEvent, currentEvent.day()));
        console.log('Scheduler Timeline Length: ' + this.timeline.days.length);
        let daysToWait = currentEvent.day();
        if (daysToWait === null) {
          if (currentEvent.dependency) {
            console.log('Dependency: ' + currentEvent.dependency);
            console.log('# Completed Visits: ' + this.completedEvents.length);
            console.log('Last Completed Visit: ' + this.completedEvents[this.completedEvents.length - 1].name);
            let dependency = this.completedEvents.find(v => v.name === currentEvent.dependency);
            console.log('Dependency on: ' + dependency.name);
            daysToWait = 1;
          }
        }
        console.log('Days to Wait: ' + daysToWait);
        this.setTimer(daysToWait).done(this.scheduleVisit, this, [currentEvent]);
        this.eventsIndex++;
      }
    }
  }
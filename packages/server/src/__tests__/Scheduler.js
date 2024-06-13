
   /*
    * The Scheduler is based on code copied from on simjs.updated (https://github.com/btelles/simjs-updated) and is used to run the simulations.
    *
    * The Events and Timeline are based on TypeScript classes so they are created externally and passed in to the Scheduler.
    */
   export class Scheduler extends Sim.Entity {
    static day = new Sim.Event("Day");
    static studyEvent = new Sim.Event("Visit");
    static completedEvents = [];
    static events;
    static timeline;
      
      start() {
        console.log('Scheduler Start');
        this.eventsIndex = 0;
        this.scheduleVisit(Scheduler.studyEvent, Scheduler.events[this.eventsIndex]);
      }

      static setEvents(events) {
        console.log('Setting Events of length: ' + events.length);
        Scheduler.events = events;
      }

      static setTimeline(timeline) {
        console.log('Setting Timeline');
        Scheduler.timeline = timeline;
      }

      scheduleVisit(visit) {
        console.log('Scheduling Visit where eventsIndex is:' + this.eventsIndex);
        if (this.eventsIndex > 0) {
          console.log('Finished Visit: ' + this.eventsIndex.toFixed(0));
          // First visit isn't in the events array
          Scheduler.completedEvents.push(Scheduler.events[this.eventsIndex - 1]);
        }
        console.log('completedEvents len: ' + Scheduler.completedEvents.length);
        if (this.eventsIndex >= Scheduler.events.length) {
          console.log('Study Complete');
        } else {
          let currentEvent = Scheduler.events[this.eventsIndex];
          console.log('Scheduling Visit: ' + (this.eventsIndex+1).toFixed(0));  // +1 because we are 0 indexed but what to display as a 1-based visit number
          console.log('Adding to Timeline Event Name: ' + currentEvent.name() + ' on Day: ' + currentEvent.day());
          Scheduler.timeline.addEvent(Scheduler.timeline.newEventInstance(currentEvent, currentEvent.day()));
          console.log('Scheduler Timeline Length: ' + Scheduler.timeline.days.length);
          let daysToWait = currentEvent.day();
          if (daysToWait === null) {
            if (currentEvent.dependency) {
              console.log('Dependency: ' + currentEvent.dependency);
              console.log('# Completed Visits: ' + Scheduler.completedEvents.length);
              console.log('Last Completed Visit: ' + Scheduler.completedEvents[Scheduler.completedEvents.length - 1].name);
              let dependency = Scheduler.completedEvents.find(v => v.name === currentEvent.dependency);
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
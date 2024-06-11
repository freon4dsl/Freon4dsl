
   export class Schedule extends Sim.Entity {
    static day = new Sim.Event("Day");
    static studyStartEvent = new Sim.Event("Visit");
    static completedEvents = [];
    static events = [];
    static timeline = [];
      
      start() {
        console.log('Schedule Start');
        this.eventsIndex = 0;
        this.scheduleVisit(Schedule.studyStartEvent, Schedule.events[this.eventsIndex]);
      }

      static setEvents(events) {
        console.log('Setting Events of length: ' + events.length);
        Schedule.events = events;
      }

      static setTimeline(timeline) {
        console.log('Setting Timeline');
        Schedule.timeline = timeline;
      }

      scheduleVisit(visit) {
        console.log('Scheduling Visit where eventsIndex is:' + this.eventsIndex);
        if (this.eventsIndex > 0) {
          console.log('Finished Visit: ' + this.eventsIndex.toFixed(0));
          // First visit isn't in the events array
          Schedule.completedEvents.push(Schedule.events[this.eventsIndex - 1]);
        }
        console.log('completedEvents len: ' + Schedule.completedEvents.length);
        if (this.eventsIndex >= Schedule.events.length) {
          console.log('Study Complete');
        } else {
          let currentEvent = Schedule.events[this.eventsIndex];
          console.log('Scheduling Visit: ' + (this.eventsIndex+1).toFixed(0));  // +1 because we are 0 indexed but what to display as a 1-based visit number
          console.log('Adding to Timeline Event Name: ' + currentEvent.name() + ' on Day: ' + currentEvent.day());
          Schedule.timeline.addEvent(Schedule.timeline.newEventInstance(currentEvent.name(), currentEvent.day()));
          let daysToWait = currentEvent.day();
          if (daysToWait === null) {
            if (currentEvent.dependency) {
              console.log('Dependency: ' + currentEvent.dependency);
              console.log('# Completed Visits: ' + Schedule.completedEvents.length);
              console.log('Last Completed Visit: ' + Schedule.completedEvents[Schedule.completedEvents.length - 1].name);
              let dependency = Schedule.completedEvents.find(v => v.name === currentEvent.dependency);
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
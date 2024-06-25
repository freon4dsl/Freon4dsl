import * as Sim from "../simjs/sim.js"


   /*
    * The Scheduler is based on code copied from on simjs.updated (https://github.com/btelles/simjs-updated) and is used to run the simulations.
    *
    * The Events and Timeline are based on TypeScript classes so they are created externally and passed in to the this.
    */
  export class Scheduler extends Sim.Entity {
    simulation;

    start(...args) {
      this.simulation = args[0];
      // Scheduling starts with all the events that are scheduled on specific days.
      // This must include something that is the study start day that is assumed to be day 0.
      this.scheduleEventsOnSpecificDays();
    }

    getScheduledStudyConfiguration() {
      return this.simulation.scheduledStudyConfiguration;
    }

    getTimeline() {
      return this.simulation.getTimeline();
    }

    getEvents() {
      return this.getScheduledStudyConfiguration().getEvents();
    }

    // Find all the events with First-Scheduled on just a specific day and schedule them.
    scheduleEventsOnSpecificDays() {
      let eventsScheduledOnASpecificDay = this.getScheduledStudyConfiguration().getEventsOnScheduledOnASpecificDay();
      for (let event of eventsScheduledOnASpecificDay) {
        let daysToWait = event.day();
        console.log('Scheduling Specific Day Event: ' + event.name() + ' on Day: ' + daysToWait);
        this.setTimer(daysToWait).done(this.eventCompleted, this, [this.getTimeline().newEventInstance(event, daysToWait)]);
      }
    }

    eventCompleted(completedEvent) {
      console.log('Completed Event:' + completedEvent.name + ' at time: ' + this.time());
      this.getTimeline().setCompleted(completedEvent);
      this.getTimeline().setCurrentDay(this.time())
      this.getTimeline().addEvent(completedEvent,this.time());
      if (this.getScheduledStudyConfiguration().isScheduleComplete(this.getTimeline())) {
        console.log('No Events to Schedule');
      } else {
        console.log('Scheduling Next Event');
        let eventsToBeScheduled = this.getScheduledStudyConfiguration().getReadyEvents(this.getTimeline());
        for (let event of eventsToBeScheduled) {
          let daysToWait = event.day();
          console.log('Scheduling Event: ' + event.name() + ' on Day: ' + daysToWait);
          this.setTimer(daysToWait).done(this.eventCompleted, this, [this.getTimeline().newEventInstance(event, daysToWait)]);
        }
      }
    }
  }
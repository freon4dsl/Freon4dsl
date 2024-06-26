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

    scheduleEvent(schedulingMsg, scheduledEvent, timeline, daysToWait) {
      console.log(schedulingMsg + ": " + scheduledEvent.name() + ' with wait of: ' + daysToWait + ' days');
      let eventInstance = timeline.newEventInstance(scheduledEvent, daysToWait);
      this.setTimer(daysToWait).done(this.eventCompleted, this, [eventInstance]);
      timeline.setScheduled(eventInstance);
    }

    // Find all the events with First-Scheduled on just a specific day and schedule them.
    scheduleEventsOnSpecificDays() {
      let eventsScheduledOnASpecificDay = this.getScheduledStudyConfiguration().getEventsOnScheduledOnASpecificDay();
      for (let scheduledEvent of eventsScheduledOnASpecificDay) {
        let daysToWait = scheduledEvent.day();
        this.scheduleEvent('Scheduling Specific Day Event', scheduledEvent, this.getTimeline(), daysToWait);
      }
    }

    eventCompleted(completedEvent) {
      console.log('Completed Event:' + completedEvent.name + ' at time: ' + this.time());
      let timeline = this.getTimeline();
      timeline.setCompleted(completedEvent);
      timeline.setCurrentDay(this.time())
      timeline.addEvent(completedEvent,this.time());
      if (this.getScheduledStudyConfiguration().anyEventsToSchedule(timeline)) {
        console.log('No Events to Schedule');
      } else {
        console.log('Scheduling Next Event');
        let readyScheduledEvents = this.getScheduledStudyConfiguration().getEventsReadyToBeScheduled(timeline);
        for (let scheduledEvent of readyScheduledEvents) {
          let daysToWait = scheduledEvent.daysToWait(timeline, this.time());
          this.scheduleEvent('Scheduling Event', scheduledEvent, timeline, daysToWait);
        }
      }
    }
  }
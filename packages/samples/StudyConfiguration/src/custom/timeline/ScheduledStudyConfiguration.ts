import { EventInstance, Timeline } from "./Timeline";
import { Day, Period, StudyConfiguration } from "../../language/gen";
import { ScheduledEvent } from "./ScheduledEvent";
import { ScheduledPeriod } from "./ScheduledPeriod";

// StudyConfigurationSchedule is a wrapper around a StudyConfiguration that manages access to instances of ScheduledPeriods and ScheduledEvents of those periods.
// These classes have the behavior needed for simulation and timelines that are not part of the DSL-based StudyConfiguration.

export class ScheduledStudyConfiguration {
  scheduledPeriods: ScheduledPeriod[] = [];
  scheduledEvents: ScheduledEvent[] = [];
  studyConfiguration: StudyConfiguration;

  constructor(studyConfiguration: StudyConfiguration) {
    this.studyConfiguration = studyConfiguration;
    this.scheduledPeriods = this.getConfiguredPeriods().map(period => new ScheduledPeriod(period));
  }

  getAllEventsInSchedule() {
    return this.scheduledPeriods.map(scheduledPeriod => scheduledPeriod.getAllScheduledEvents().flat()).flat();
  }

  getConfiguredPeriods() {
    return this.studyConfiguration.periods;
  }

  getFirstScheduledPeriod() { 
    //TODO: change to search for the period with a visit on day-0 or StartDay.
    return this.scheduledPeriods[0];
  }

  getScheduledEvents() {
    return this.scheduledEvents;
  }

  getAllEventsInAScheduledPeriod(scheduledPeriod: ScheduledPeriod) {
    return this.getAllEventsInAPeriod(scheduledPeriod.configuredPeriod);
  }

  getAllEventsInAPeriod(period: Period) {
    let scheduledPeriod = this.scheduledPeriods.find(scheduledPeriod => scheduledPeriod.configuredPeriod === period);
    if (scheduledPeriod) {
      return scheduledPeriod.getAllScheduledEvents();
    } else {
      return [];
    }
  }

  getScheduledPeriod(period: Period) {
    let scheduledPeriod = this.scheduledPeriods.find(scheduledPeriod => scheduledPeriod.configuredPeriod === period);
    if (!scheduledPeriod) {
      console.log("no scheduledPeriod found", scheduledPeriod);
    }
    return scheduledPeriod;
  }

  getFirstStudyStartEvent(): ScheduledEvent | undefined {
    let eventsOnADay = this.getEventsOnScheduledOnASpecificDay();
    let firstEventOnDay1 = eventsOnADay.find(scheduledEvent => {
      if (scheduledEvent.configuredEvent.schedule.eventStart instanceof Day) {
        return (scheduledEvent.configuredEvent.schedule.eventStart as Day).startDay as number === 1;
      } else {return false;}
    });
    return firstEventOnDay1;
  }

  getEventsOnScheduledOnASpecificDay(): ScheduledEvent[]  {
    let firstPeriod = this.getFirstScheduledPeriod(); //TODO: check if in any period?
    return firstPeriod.scheduledEvents.filter(scheduledEvent => scheduledEvent.configuredEvent.schedule.eventStart instanceof Day);
  }

  // anyEventsToSchedule(timeline): boolean {
  //   let firstNoScheduledEvent = this.getAllEventsInSchedule().find(scheduledEvent => scheduledEvent.notYetScheduled(timeline));
  //   return firstNoScheduledEvent === undefined;
  // }

  getEventsReadyToBeScheduled(completedEvent: EventInstance, timeline: Timeline) {
    let readyEvents = this.getAllEventsInSchedule().filter(scheduledEvent => scheduledEvent.getInstanceIfEventIsReadyToSchedule(completedEvent, timeline));
    return readyEvents;
  }
}


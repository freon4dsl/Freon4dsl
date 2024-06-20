import { Timeline } from "./Timeline";
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
    this.setupScheduledPeriodsAndEvents();
  }

  // Setup the ScheduledEvents to be a ScheduleEvent for every Event in every Period of the StudyConfiguration
  setupScheduledPeriodsAndEvents() {
    this.scheduledPeriods = this.getConfiguredPeriods().map(period => new ScheduledPeriod(period));
  }

  getAllScheduledEvents() {
    return this.scheduledPeriods.map(scheduledPeriod => scheduledPeriod.getAllScheduledEvents().flat()).flat();
  }

  getConfiguredPeriods() {
    return this.studyConfiguration.periods;
  }

  getFirstPeriod() {
    return this.scheduledPeriods[0];
  }

  getFirstScheduledPeriod() { 
    return this.scheduledPeriods[0];
  }

  getEvents() {
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

  getFirstEvent() {
    let firstPeriod = this.getFirstPeriod();
    let firstEventOnDay1 = firstPeriod.scheduledEvents.find(scheduledEvent => {
      if (scheduledEvent.configuredEvent.schedule.eventStart instanceof Day) {
        return (scheduledEvent.configuredEvent.schedule.eventStart as Day).startDay as number === 1;
      } else {return false;}
    });
    return firstEventOnDay1;
  }

  getReadyEvents(timeline: Timeline) {
    console.log("this.getAllScheduledEvents: " + this.getAllScheduledEvents().length);
    let readyEvents = this.getAllScheduledEvents().filter(scheduledEvent => scheduledEvent.getInstanceIfEventIsReady(timeline));
    return readyEvents;
  } 
}


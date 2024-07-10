import * as Sim from "../simjs/sim.js"
import { StudyConfigurationModelEnvironment } from "../../config/gen/StudyConfigurationModelEnvironment";  
import {StudyConfiguration, Period, Event, EventSchedule, Day, BinaryExpression, PlusExpression, When, StartDay, Number, EventReference, RepeatCondition, RepeatUnit } from "../../language/gen/index";
import { FreNodeReference } from "@freon4dsl/core";
import { EventInstance, TimelineInstanceState, Timeline, PeriodInstance } from "../timeline/Timeline";
import { ScheduledEvent, ScheduledEventState } from "../timeline/ScheduledEvent";
import { ScheduledPeriod } from "../timeline/ScheduledPeriod";

// Setup the sim.js environment and an empty StudyConfiguration.
export function setupStudyConfiguration(): StudyConfiguration{
  new Sim.Sim(); // For some reason, need to do this for Sim to be properly loaded and available in the Scheduler class used by the Simulator.
  let studyConfigurationModelEnvironment = StudyConfigurationModelEnvironment.getInstance();
  let studyConfigurationModel = studyConfigurationModelEnvironment.newModel("Study1");
  let studyConfiguration = studyConfigurationModel.newUnit("StudyConfiguration") as StudyConfiguration;
  return studyConfiguration;
}

// Create a EventSchedule DSL element and set its 'eventStart' to a 'When' DSL element defined by a binary expression. 
export function createWhenEventSchedule(eventName: string, binaryExpression: BinaryExpression) {
  let eventSchedule = new EventSchedule(eventName + binaryExpression.toString());
  let whenExpression = new When(eventName + binaryExpression.toString);
  whenExpression.startWhen = binaryExpression;
  eventSchedule.eventStart = whenExpression;
  return eventSchedule;
}

// Create a EventSchedule DSL element and set its 'eventStart' to a 'Day' DSL element starting 'startDay'. 
export function createEventScheduleStartingOnADay(uniquePrefix: string, startDay: number) {
  let eventSchedule = new EventSchedule(uniquePrefix + "EventSchedule");
  let day = new Day(uniquePrefix + startDay.toString);
  day.startDay = startDay;
  eventSchedule.eventStart = day;
  return eventSchedule;
}

export function createDay1EventScheduleThatRepeats(eventName: string, numberOfRepeats: number) {
  let eventSchedule = createEventScheduleStartingOnADay(eventName, 1);
  let repeatCondition = new RepeatCondition("RepeatCount-" + eventName);
  repeatCondition.maxRepeats = numberOfRepeats;
  let reference = FreNodeReference.create(RepeatUnit.weekly, "RepeatUnit");
  repeatCondition.repeatUnit = reference;
  eventSchedule.eventRepeat = repeatCondition;
  return eventSchedule;
}

// Add a Event DSL element to a Period DSL element.
export function createEventAndAddToPeriod(period: Period, eventName: string, eventSchedule: EventSchedule): Event {
  let event = new Event(eventName);
  event.name = eventName; 
  event.schedule = eventSchedule;
  period.events.push(event);
  return event;
}

/* Add a Period DSL element containing two Events to the Study Configuration:
 * - First event named 'event1Name' starts on 'event1Day'
 * - Second event named 'event2Name'  starts 'When StartDay + event2Day' .
 * Return the updated Study Configuration.
 */
export function addAPeriodAndTwoEvents(studyConfiguration: StudyConfiguration, periodName: string, event1Name: string, event1Day: number, event2Name: string, event2Day ): StudyConfiguration {
  let period = new Period(periodName);
  period.name = periodName;

  let dayEventSchedule = createEventScheduleStartingOnADay(event1Name, event1Day);
  createEventAndAddToPeriod(period, event1Name, dayEventSchedule);

  let when = createWhenEventSchedule(event2Name, PlusExpression.create({left:  new StartDay(), 
                                                                       right: Number.create({value:event2Day})}));
  createEventAndAddToPeriod(period, event2Name, when);

  studyConfiguration.periods.push(period);
  return studyConfiguration;
}


export function addEventScheduledOffCompletedEvent(studyConfiguration: StudyConfiguration, periodName: string, event1Name: string, event1Day: number, event2Name: string, event2Day: number ): StudyConfiguration {
  let period = new Period(periodName);
  period.name = periodName;

  let dayEventSchedule = createEventScheduleStartingOnADay(event1Name, event1Day);
  let firstEvent = createEventAndAddToPeriod(period, event1Name, dayEventSchedule);

  let eventReference = new EventReference(event1Name);
  let freNodeReference = FreNodeReference.create(firstEvent, "Event");
  eventReference.event = freNodeReference;
  let when = createWhenEventSchedule(event2Name, PlusExpression.create({left: eventReference,
                                                                        right: Number.create({value:event2Day})}));

  createEventAndAddToPeriod(period, event2Name, when);

  studyConfiguration.periods.push(period);
  return studyConfiguration;
}

export interface EventsToAdd {
  eventName: string;
  eventDay: number;
  repeat: number;
  period: string;
}

export function addEventsScheduledOffCompletedEvents(studyConfiguration: StudyConfiguration, eventsToAdd: EventsToAdd[]  ): StudyConfiguration {
  let periodName = eventsToAdd[0].period;
  let period = new Period(periodName);
  period.name = periodName;
  // Setup the study start event
  console.log("Adding the first event: " + eventsToAdd[0].eventName + " day: " + eventsToAdd[0].eventDay);
  let dayEventSchedule = createEventScheduleStartingOnADay(eventsToAdd[0].eventName, eventsToAdd[0].eventDay);
  let previousEvent = createEventAndAddToPeriod(period, eventsToAdd[0].eventName, dayEventSchedule);
  studyConfiguration.periods.push(period);

  // Add subsequent events scheduled off the previous event
  let firstEvent = true;
  eventsToAdd.forEach(eventToAdd => {
    console.log("current period: "+ periodName + " eventToAdd: " + eventToAdd.eventName + " day: " + eventToAdd.eventDay + " period: " + eventToAdd.period);
    if (firstEvent) { // Skip the first event as it is already added
      firstEvent = false;
      return;
    }
    let newPeriod = false;
    let eventReference = new EventReference(eventToAdd.eventName);
    if (periodName !== eventToAdd.period) {
      console.log("Creating new period: " + eventToAdd.period);
      periodName = eventToAdd.period;
      period = new Period(periodName);
      period.name = periodName;
      newPeriod = true;
    }    
    let freNodeReference = FreNodeReference.create(previousEvent, "Event");
    eventReference.event = freNodeReference;
    let when = createWhenEventSchedule(eventToAdd.eventName, PlusExpression.create({left: eventReference,
                                                                                   right: Number.create({value:eventToAdd.eventDay})}));
    previousEvent = createEventAndAddToPeriod(period, eventToAdd.eventName, when);
    if (newPeriod) {
      console.log("Adding the new period: " + periodName);
      studyConfiguration.periods.push(period);
    }
  });
  console.log("studyConfiguration # periods: " + studyConfiguration.periods.length );
  console.log("studyConfiguration first period: " + studyConfiguration.periods[0].name + " # events:" + studyConfiguration.periods[0].events.length + " event name: " + studyConfiguration.periods[0].events[0].name);
  console.log("studyConfiguration second period: " + studyConfiguration.periods[1].name + " # events:" + studyConfiguration.periods[0].events.length);
  return studyConfiguration;
}

export function addRepeatingEvents(studyConfiguration: StudyConfiguration, periodName: string, eventsToAdd: EventsToAdd[]): StudyConfiguration {
  let period = new Period(periodName);
  period.name = periodName;
  // Setup the study start event
  let dayEventSchedule = createDay1EventScheduleThatRepeats(eventsToAdd[0].eventName, eventsToAdd[0].repeat);
  let event = createEventAndAddToPeriod(period, eventsToAdd[0].eventName, dayEventSchedule);
  studyConfiguration.periods.push(period);
  return studyConfiguration;
}

export function addScheduledEventAndInstanceToTimeline(studyConfiguration: StudyConfiguration, periodNumber: number, eventNumberWithinPeriod: number, dayEventCompleted: number, timeline: Timeline, nameOfPeriodToAddEventTo?: string) : EventInstance {
  let eventInstance = null;
  if (nameOfPeriodToAddEventTo) {
    let scheduledPeriod = null;
    let currentPeriodInstance = timeline.getPeriodInstanceFor(nameOfPeriodToAddEventTo);
    if (currentPeriodInstance === undefined) {
      let configuredPeriod = studyConfiguration.periods[periodNumber];
      scheduledPeriod = new ScheduledPeriod(configuredPeriod);
      let periodInstance = new PeriodInstance(scheduledPeriod, dayEventCompleted);
      periodInstance.setState(TimelineInstanceState.Active);
      timeline.addEvent(periodInstance);
    } else {
      scheduledPeriod = currentPeriodInstance.scheduledPeriod;
    }
    let scheduledEvent = scheduledPeriod.scheduledEvents[eventNumberWithinPeriod];
    scheduledEvent.state = ScheduledEventState.Scheduled;
    let eventInstance = new EventInstance(scheduledEvent, dayEventCompleted);
    eventInstance.state = TimelineInstanceState.Completed;
    timeline.addEvent(eventInstance);
  } else { // TODO: drop this path after all the tests that didn't set the period are updated
    let scheduledEvent = new ScheduledEvent(studyConfiguration.periods[0].events[eventNumberWithinPeriod]);
    scheduledEvent.state = ScheduledEventState.Scheduled;
    let eventInstance = new EventInstance(scheduledEvent, dayEventCompleted);
    eventInstance.state = TimelineInstanceState.Completed;
    timeline.addEvent(eventInstance);
  }
  return eventInstance;
}




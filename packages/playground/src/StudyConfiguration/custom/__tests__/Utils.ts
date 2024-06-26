import * as Sim from "../simjs/sim.js"
import { StudyConfigurationModelEnvironment } from "../../config/gen/StudyConfigurationModelEnvironment";  
import {StudyConfiguration, Period, Event, EventSchedule, Day, BinaryExpression, PlusExpression, When, StartDay, Number, EventReference } from "../../language/gen/index";
import { FreNodeReference } from "@freon4dsl/core";

// Setup the sim.js environment and an empty StudyConfiguration.
export function setupEnvironment(): StudyConfiguration{
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

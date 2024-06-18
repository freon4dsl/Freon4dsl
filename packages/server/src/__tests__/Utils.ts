import * as Sim from "../../../playground/src/StudyConfiguration/simjs/sim.js"
import { StudyConfigurationModelEnvironment } from "../../../playground/src/StudyConfiguration/config/gen/StudyConfigurationModelEnvironment";  
import {StudyConfiguration, Period, Event, EventSchedule, Day, BinaryExpression, PlusExpression, When, StartDay, Number } from "../../../playground/src/StudyConfiguration/language/gen/index";

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
export function createDayEventSchedule(eventName: string, startDay: number) {
  let eventSchedule = new EventSchedule(eventName + "EventSchedule");
  let day = new Day(eventName + startDay.toString);
  day.startDay = startDay;
  eventSchedule.eventStart = day;
  return eventSchedule;
}

// Add a Event DSL element to a Period DSL element.
export function addEventToPeriod(period: Period, eventName: string, eventSchedule: EventSchedule): Event {
  let event = new Event(eventName);
  event.name = eventName; 
  event.schedule = eventSchedule;
  period.events.push(event);
  return event;
}

// Add a Period DSL element containing Events based on a Day and When DSL EventSchedule elements to the Study Configuration.
export function addAPeriodAndTwoEvents(studyConfiguration: StudyConfiguration, periodName: string, event1Name: string, event1Day: number, event2Name: string, event2Day ): StudyConfiguration {
  let period = new Period(periodName);
  period.name = periodName;

  let dayEventSchedule = createDayEventSchedule(event1Name, event1Day);
  addEventToPeriod(period, event1Name, dayEventSchedule);

  let when = createWhenEventSchedule(event2Name, PlusExpression.create({left:  new StartDay(), 
                                                                       right: Number.create({value:event2Day})}));
  addEventToPeriod(period, event2Name, when);

  studyConfiguration.periods.push(period);
  return studyConfiguration;
}


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addScheduledEventAndInstanceToTimeline = exports.addRepeatingEvents = exports.addEventsScheduledOffCompletedEvents = exports.addEventScheduledOffCompletedEvent = exports.addAPeriodAndTwoEvents = exports.createEventAndAddToPeriod = exports.createDay1EventScheduleThatRepeats = exports.createEventScheduleStartingOnADay = exports.createWhenEventSchedule = exports.setupStudyConfiguration = void 0;
var Sim = require("../simjs/sim.js");
var StudyConfigurationModelEnvironment_1 = require("../../config/gen/StudyConfigurationModelEnvironment");
var index_1 = require("../../language/gen/index");
var core_1 = require("@freon4dsl/core");
var Timeline_1 = require("../timeline/Timeline");
var ScheduledEvent_1 = require("../timeline/ScheduledEvent");
// Setup the sim.js environment and an empty StudyConfiguration.
function setupStudyConfiguration() {
    new Sim.Sim(); // For some reason, need to do this for Sim to be properly loaded and available in the Scheduler class used by the Simulator.
    var studyConfigurationModelEnvironment = StudyConfigurationModelEnvironment_1.StudyConfigurationModelEnvironment.getInstance();
    var studyConfigurationModel = studyConfigurationModelEnvironment.newModel("Study1");
    var studyConfiguration = studyConfigurationModel.newUnit("StudyConfiguration");
    return studyConfiguration;
}
exports.setupStudyConfiguration = setupStudyConfiguration;
// Create a EventSchedule DSL element and set its 'eventStart' to a 'When' DSL element defined by a binary expression. 
function createWhenEventSchedule(eventName, binaryExpression) {
    var eventSchedule = new index_1.EventSchedule(eventName + binaryExpression.toString());
    var whenExpression = new index_1.When(eventName + binaryExpression.toString);
    whenExpression.startWhen = binaryExpression;
    eventSchedule.eventStart = whenExpression;
    console.log("eventSchedule: " + eventSchedule.toString());
    return eventSchedule;
}
exports.createWhenEventSchedule = createWhenEventSchedule;
// Create a EventSchedule DSL element and set its 'eventStart' to a 'Day' DSL element starting 'startDay'. 
function createEventScheduleStartingOnADay(uniquePrefix, startDay) {
    var eventSchedule = new index_1.EventSchedule(uniquePrefix + "EventSchedule");
    var day = new index_1.Day(uniquePrefix + startDay.toString);
    day.startDay = startDay;
    eventSchedule.eventStart = day;
    return eventSchedule;
}
exports.createEventScheduleStartingOnADay = createEventScheduleStartingOnADay;
function createDay1EventScheduleThatRepeats(eventName, numberOfRepeats) {
    var eventSchedule = createEventScheduleStartingOnADay(eventName, 1);
    var repeatCondition = new index_1.RepeatCondition("RepeatCount-" + eventName);
    repeatCondition.maxRepeats = numberOfRepeats;
    var reference = core_1.FreNodeReference.create(index_1.RepeatUnit.weekly, "RepeatUnit");
    repeatCondition.repeatUnit = reference;
    eventSchedule.eventRepeat = repeatCondition;
    return eventSchedule;
}
exports.createDay1EventScheduleThatRepeats = createDay1EventScheduleThatRepeats;
// Add a Event DSL element to a Period DSL element.
function createEventAndAddToPeriod(period, eventName, eventSchedule) {
    var event = new index_1.Event(eventName);
    event.name = eventName;
    event.schedule = eventSchedule;
    period.events.push(event);
    return event;
}
exports.createEventAndAddToPeriod = createEventAndAddToPeriod;
/* Add a Period DSL element containing two Events to the Study Configuration:
 * - First event named 'event1Name' starts on 'event1Day'
 * - Second event named 'event2Name'  starts 'When StartDay + event2Day' .
 * Return the updated Study Configuration.
 */
function addAPeriodAndTwoEvents(studyConfiguration, periodName, event1Name, event1Day, event2Name, event2Day) {
    var period = new index_1.Period(periodName);
    period.name = periodName;
    var dayEventSchedule = createEventScheduleStartingOnADay(event1Name, event1Day);
    createEventAndAddToPeriod(period, event1Name, dayEventSchedule);
    var when = createWhenEventSchedule(event2Name, index_1.PlusExpression.create({ left: new index_1.StartDay(),
        right: index_1.Number.create({ value: event2Day }) }));
    createEventAndAddToPeriod(period, event2Name, when);
    studyConfiguration.periods.push(period);
    return studyConfiguration;
}
exports.addAPeriodAndTwoEvents = addAPeriodAndTwoEvents;
function addEventScheduledOffCompletedEvent(studyConfiguration, periodName, event1Name, event1Day, event2Name, event2Day) {
    var period = new index_1.Period(periodName);
    period.name = periodName;
    var dayEventSchedule = createEventScheduleStartingOnADay(event1Name, event1Day);
    var firstEvent = createEventAndAddToPeriod(period, event1Name, dayEventSchedule);
    var eventReference = new index_1.EventReference(event1Name);
    var freNodeReference = core_1.FreNodeReference.create(firstEvent, "Event");
    eventReference.event = freNodeReference;
    var when = createWhenEventSchedule(event2Name, index_1.PlusExpression.create({ left: eventReference,
        right: index_1.Number.create({ value: event2Day }) }));
    createEventAndAddToPeriod(period, event2Name, when);
    studyConfiguration.periods.push(period);
    return studyConfiguration;
}
exports.addEventScheduledOffCompletedEvent = addEventScheduledOffCompletedEvent;
function addEventsScheduledOffCompletedEvents(studyConfiguration, periodName, eventsToAdd) {
    var period = new index_1.Period(periodName);
    period.name = periodName;
    // Setup the study start event
    var dayEventSchedule = createEventScheduleStartingOnADay(eventsToAdd[0].eventName, eventsToAdd[0].eventDay);
    var previousEvent = createEventAndAddToPeriod(period, eventsToAdd[0].eventName, dayEventSchedule);
    // Add subsequent events scheduled off the previous event
    var firstEvent = true;
    eventsToAdd.forEach(function (eventToAdd) {
        if (firstEvent) { // Skip the first event as it is already added
            firstEvent = false;
            return;
        }
        var eventReference = new index_1.EventReference(eventToAdd.eventName);
        var freNodeReference = core_1.FreNodeReference.create(previousEvent, "Event");
        eventReference.event = freNodeReference;
        var when = createWhenEventSchedule(eventToAdd.eventName, index_1.PlusExpression.create({ left: eventReference,
            right: index_1.Number.create({ value: eventToAdd.eventDay }) }));
        previousEvent = createEventAndAddToPeriod(period, eventToAdd.eventName, when);
    });
    studyConfiguration.periods.push(period);
    return studyConfiguration;
}
exports.addEventsScheduledOffCompletedEvents = addEventsScheduledOffCompletedEvents;
function addRepeatingEvents(studyConfiguration, periodName, eventsToAdd) {
    var period = new index_1.Period(periodName);
    period.name = periodName;
    // Setup the study start event
    var dayEventSchedule = createDay1EventScheduleThatRepeats(eventsToAdd[0].eventName, eventsToAdd[0].repeat);
    var event = createEventAndAddToPeriod(period, eventsToAdd[0].eventName, dayEventSchedule);
    studyConfiguration.periods.push(period);
    return studyConfiguration;
}
exports.addRepeatingEvents = addRepeatingEvents;
function addScheduledEventAndInstanceToTimeline(studyConfiguration, eventNumber, dayEventCompleted, timeline) {
    var scheduledEvent = new ScheduledEvent_1.ScheduledEvent(studyConfiguration.periods[0].events[eventNumber]);
    scheduledEvent.state = ScheduledEvent_1.ScheduledEventState.Scheduled;
    var eventInstance = new Timeline_1.EventInstance(scheduledEvent, dayEventCompleted);
    eventInstance.state = Timeline_1.TimelineInstanceState.Completed;
    timeline.addEvent(eventInstance);
    return eventInstance;
}
exports.addScheduledEventAndInstanceToTimeline = addScheduledEventAndInstanceToTimeline;

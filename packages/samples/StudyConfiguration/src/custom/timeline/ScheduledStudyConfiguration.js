"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledStudyConfiguration = void 0;
var gen_1 = require("../../language/gen");
var ScheduledPeriod_1 = require("./ScheduledPeriod");
// StudyConfigurationSchedule is a wrapper around a StudyConfiguration that manages access to instances of ScheduledPeriods and ScheduledEvents of those periods.
// These classes have the behavior needed for simulation and timelines that are not part of the DSL-based StudyConfiguration.
var ScheduledStudyConfiguration = /** @class */ (function () {
    function ScheduledStudyConfiguration(studyConfiguration) {
        this.scheduledPeriods = [];
        this.scheduledEvents = [];
        this.studyConfiguration = studyConfiguration;
        this.scheduledPeriods = this.getConfiguredPeriods().map(function (period) { return new ScheduledPeriod_1.ScheduledPeriod(period); });
    }
    ScheduledStudyConfiguration.prototype.getAllEventsInSchedule = function () {
        return this.scheduledPeriods.map(function (scheduledPeriod) { return scheduledPeriod.getAllScheduledEvents().flat(); }).flat();
    };
    ScheduledStudyConfiguration.prototype.getConfiguredPeriods = function () {
        return this.studyConfiguration.periods;
    };
    ScheduledStudyConfiguration.prototype.getFirstScheduledPeriod = function () {
        //TODO: change to search for the period with a visit on day-0 or StartDay.
        return this.scheduledPeriods[0];
    };
    ScheduledStudyConfiguration.prototype.getScheduledEvents = function () {
        return this.scheduledEvents;
    };
    ScheduledStudyConfiguration.prototype.getAllEventsInAScheduledPeriod = function (scheduledPeriod) {
        return this.getAllEventsInAPeriod(scheduledPeriod.configuredPeriod);
    };
    ScheduledStudyConfiguration.prototype.getAllEventsInAPeriod = function (period) {
        var scheduledPeriod = this.scheduledPeriods.find(function (scheduledPeriod) { return scheduledPeriod.configuredPeriod === period; });
        if (scheduledPeriod) {
            return scheduledPeriod.getAllScheduledEvents();
        }
        else {
            return [];
        }
    };
    ScheduledStudyConfiguration.prototype.getFirstStudyStartEvent = function () {
        var eventsOnADay = this.getEventsOnScheduledOnASpecificDay();
        var firstEventOnDay1 = eventsOnADay.find(function (scheduledEvent) {
            if (scheduledEvent.configuredEvent.schedule.eventStart instanceof gen_1.Day) {
                return scheduledEvent.configuredEvent.schedule.eventStart.startDay === 1;
            }
            else {
                return false;
            }
        });
        return firstEventOnDay1;
    };
    ScheduledStudyConfiguration.prototype.getEventsOnScheduledOnASpecificDay = function () {
        var firstPeriod = this.getFirstScheduledPeriod(); //TODO: check if in any period?
        return firstPeriod.scheduledEvents.filter(function (scheduledEvent) { return scheduledEvent.configuredEvent.schedule.eventStart instanceof gen_1.Day; });
    };
    // anyEventsToSchedule(timeline): boolean {
    //   let firstNoScheduledEvent = this.getAllEventsInSchedule().find(scheduledEvent => scheduledEvent.notYetScheduled(timeline));
    //   return firstNoScheduledEvent === undefined;
    // }
    ScheduledStudyConfiguration.prototype.getEventsReadyToBeScheduled = function (completedEvent, timeline) {
        var readyEvents = this.getAllEventsInSchedule().filter(function (scheduledEvent) { return scheduledEvent.getInstanceIfEventIsReadyToSchedule(completedEvent, timeline); });
        return readyEvents;
    };
    return ScheduledStudyConfiguration;
}());
exports.ScheduledStudyConfiguration = ScheduledStudyConfiguration;

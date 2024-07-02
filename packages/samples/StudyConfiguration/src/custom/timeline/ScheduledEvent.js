"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledEvent = exports.ScheduledEventState = void 0;
var index_1 = require("../../language/gen/index");
var core_1 = require("@freon4dsl/core");
var MainStudyConfigurationModelInterpreter_1 = require("../../interpreter/MainStudyConfigurationModelInterpreter");
var Timeline_1 = require("./Timeline");
var ScheduledEventState;
(function (ScheduledEventState) {
    ScheduledEventState[ScheduledEventState["Initial"] = 0] = "Initial";
    ScheduledEventState[ScheduledEventState["Ready"] = 1] = "Ready";
    ScheduledEventState[ScheduledEventState["Active"] = 2] = "Active";
    ScheduledEventState[ScheduledEventState["Scheduled"] = 3] = "Scheduled";
    ScheduledEventState[ScheduledEventState["Completed"] = 4] = "Completed";
})(ScheduledEventState || (exports.ScheduledEventState = ScheduledEventState = {}));
;
/*
 * A ScheduledEvent is a wrapper around an Event from the StudyConfiguration language.
 * It provides a simplified interface for the simulator and allows for the same Event to be scheduled multiple times.
 */
var ScheduledEvent = /** @class */ (function () {
    function ScheduledEvent(event) {
        this.state = ScheduledEventState.Initial;
        this.configuredEvent = event;
    }
    ScheduledEvent.prototype.day = function (timeline) {
        var eventStart = this.configuredEvent.schedule.eventStart;
        var interpreter = new MainStudyConfigurationModelInterpreter_1.MainStudyConfigurationModelInterpreter();
        interpreter.setTracing(true);
        var ctx = core_1.InterpreterContext.EMPTY_CONTEXT;
        ctx.set("timeline", timeline);
        var value = interpreter.evaluate(eventStart); //was evaluateWithContext need to add back: , ctx
        if ((0, core_1.isRtError)(value)) {
            console.log("interpreter isRtError, value: " + value.toString());
        }
        else {
            var trace = interpreter.getTrace().root.toStringRecursive();
            if (!timeline) {
                console.log("ScheduledEvent.day() timeline is null: " + trace);
            }
            else {
                if (timeline.currentDay > 8) {
                    console.log("ScheduledEvent.day() trace: " + trace);
                }
            }
        }
        // console.log("ScheduledEvent.day() for: " + this.name() + " is: " + (value as RtNumber).value);
        return value.value;
    };
    // If a specific day is specified for the event to start on then return that day
    // otherwise return the number of days to wait from the timeline's current day.
    ScheduledEvent.prototype.daysToWait = function (completedEvent, timeline, timeNow) {
        if (completedEvent.scheduledEvent.name() === this.name() && this.isRepeatingEvent() && this.anyRepeatsNotCompleted(timeline)) {
            var waitInDays = this.daysTillNextRepeat(completedEvent);
            console.log("ScheduledEvent.daysToWait() for: " + this.name() + " is to be repeated on timeline day: " + timeline.currentDay + " with scheduledDay of: " + waitInDays);
            return waitInDays;
        }
        if (this.configuredEvent.schedule.eventStart instanceof index_1.Day) {
            console.log("ScheduledEvent.daysToWait() for: " + this.name() + " timeline.currentDay: " + timeline.currentDay + " day: " + this.day(timeline) + " result: " + this.day(timeline));
            return this.day(timeline);
        }
        else {
            console.log("ScheduledEvent.daysToWait() for: " + this.name() + " timeline.currentDay: " + timeline.currentDay + " day: " + this.day(timeline) + " result: " + (this.day(timeline) - timeline.currentDay));
            return this.day(timeline) - timeline.currentDay;
        }
    };
    ScheduledEvent.prototype.getState = function () {
        return this.state;
    };
    ScheduledEvent.prototype.setState = function (state) {
        this.state = state;
    };
    ScheduledEvent.prototype.name = function () {
        return this.configuredEvent.name;
    };
    ScheduledEvent.prototype.dependency = function () {
        return null;
    };
    ScheduledEvent.prototype.isRepeatingEvent = function () {
        return this.configuredEvent.schedule.eventRepeat instanceof index_1.RepeatCondition;
    };
    ScheduledEvent.prototype.anyRepeatsNotCompleted = function (timeline) {
        var numberCompletedInstances = timeline.numberCompletedInstancesOf(this);
        if (this.isRepeatingEvent) {
            var repeatCondition = this.configuredEvent.schedule.eventRepeat;
            if (numberCompletedInstances <= repeatCondition.maxRepeats) { // Less that or equal because the first instance is not counted as a repeat.
                console.log("anyRepeatsNotCompleted: " + this.name() + " timeline: " + timeline.currentDay + " maxRepeats: " + repeatCondition.maxRepeats + " numberCompletedInstances: " + numberCompletedInstances);
                return true;
            }
        }
        console.log("anyRepeatsNotCompleted: " + this.name() + " timeline: " + timeline.currentDay + " numberCompletedInstances: " + numberCompletedInstances + " result: false");
        return false;
    };
    ScheduledEvent.prototype.notYetScheduled = function (timeline) {
        try {
            console.log('notYetScheduled: ' + this.name() + ' timeline: ' + timeline.currentDay + ' day: ' + this.day(timeline) + ' result: ' + (this.anyRepeatsNotCompleted(timeline) || this.getState() === ScheduledEventState.Initial));
            // return this.anyRepeatsNotCompleted(timeline) || timeline.noCompletedInstanceOf(this);
            return this.anyRepeatsNotCompleted(timeline) || this.getState() === ScheduledEventState.Initial;
        }
        catch (e) {
            console.log("notYetScheduled caught exception: " + e.toString());
            // This exception is expected to happen when Event has dependency on another event that has not been completed so evaluation of FirstScheduled fails.
            return false;
        }
    };
    ScheduledEvent.prototype.daysTillNextRepeat = function (completedEvent) {
        var repeatCondition = this.configuredEvent.schedule.eventRepeat;
        var repeatUnit = repeatCondition.repeatUnit.referred;
        var repeatDays = 0;
        switch (repeatUnit) {
            case index_1.RepeatUnit.daily:
                repeatDays = 1;
                break;
            case index_1.RepeatUnit.weekly:
                repeatDays = 7;
                break;
            case index_1.RepeatUnit.monthly:
                repeatDays = 30;
                break;
            default:
                repeatDays = 0;
        }
        return repeatDays;
    };
    /*
    * TODO: update this description...
    *
     * if this event has not been completed on a previous day and the timeline day is at or after the day this event is scheduled for then return a new EventInstance
     * otherwise return null.
     */
    ScheduledEvent.prototype.getInstanceIfEventIsReadyToSchedule = function (completedEvent, timeline) {
        var repeatingEvent = this.isRepeatingEvent();
        if (this.configuredEvent.schedule.eventStart instanceof index_1.Day && !repeatingEvent) {
            console.log("getInstanceIfEventIsReady: Not ready to schedule because:" + this.name() + " is scheduled to start on a specific day");
            return null;
        }
        else if (completedEvent.scheduledEvent.name() === this.name() && repeatingEvent && this.anyRepeatsNotCompleted(timeline)) {
            console.log("getInstanceIfEventIsReady: " + this.name() + " is to be repeated on timeline day: " + timeline.currentDay + " with scheduledDay of: " + this.day(timeline));
            return new Timeline_1.EventInstance(this);
        }
        else {
            var scheduledDay = this.day(timeline);
            if (timeline.noCompletedInstanceOf(this) && scheduledDay != undefined && scheduledDay >= timeline.currentDay) {
                console.log("getInstanceIfEventIsReady: " + this.name() + " is to be scheduled on timeline day: " + timeline.currentDay + " with scheduledDay of: " + scheduledDay);
                return new Timeline_1.EventInstance(this);
            }
            else {
                console.log("getInstanceIfEventIsReady: " + this.name() + " is NOT to be scheduled on timeline day: " + timeline.currentDay + " with scheduledDay of: " + scheduledDay);
                return null;
            }
        }
    };
    ScheduledEvent.prototype.updatePeriodIfNeeded = function (timeline) {
        // if (timeline.currentPeriod != this.configuredEvent.period) {
        //   timeline.currentPeriod = this.configuredEvent.period;
        // }
    };
    return ScheduledEvent;
}());
exports.ScheduledEvent = ScheduledEvent;

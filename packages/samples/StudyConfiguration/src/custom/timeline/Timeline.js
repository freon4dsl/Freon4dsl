"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhaseOccurrence = exports.TimelineDay = exports.EventInstance = exports.TimelineInstanceState = exports.PeriodInstance = exports.TimelineInstance = exports.Timeline = void 0;
var core_1 = require("@freon4dsl/core");
var ScheduledEvent_1 = require("./ScheduledEvent");
/*
 * A Timeline records the events and the days they occur on.
 */
var Timeline = /** @class */ (function (_super) {
    __extends(Timeline, _super);
    function Timeline() {
        var _this = _super.call(this) || this;
        _this.days = [];
        _this.phaseOccurrences = [];
        _this.currentDay = 0;
        return _this;
    }
    Timeline.prototype.equals = function (other) {
        throw new Error('Timelines are not comparable. Method not implemented.');
    };
    Timeline.prototype.newEventInstance = function (scheduledEvent, dayEventWillOccurOn, startDay, endDay) {
        return new EventInstance(scheduledEvent, dayEventWillOccurOn, startDay, endDay);
    };
    Timeline.prototype.getDays = function () {
        return this.days;
    };
    Timeline.prototype.moveToNextDay = function () {
        this.currentDay++;
    };
    Timeline.prototype.setCurrentDay = function (day) {
        this.currentDay = day;
    };
    // wrapper so Scheduler can set event statuses
    Timeline.prototype.setCompleted = function (completedEvent) {
        completedEvent.state = TimelineInstanceState.Completed;
    };
    Timeline.prototype.setScheduled = function (eventInstance) {
        eventInstance.state = TimelineInstanceState.Scheduled;
        eventInstance.scheduledEvent.setState(ScheduledEvent_1.ScheduledEventState.Scheduled);
    };
    Timeline.prototype.addEvent = function (event) {
        var day = this.days.find(function (d) { return d.day === event.startDay; });
        if (!day) {
            day = new TimelineDay(event.startDay);
            this.days.push(day);
        }
        day.events.push(event);
    };
    Timeline.prototype.getEvents = function (day) {
        var timelineDay = this.days.find(function (d) { return d.day === day; });
        return timelineDay ? timelineDay.events : [];
    };
    Timeline.prototype.getLastInstanceForThisEvent = function (eventToMatch) {
        var allEventInstances = this.days.flatMap(function (day) { return day.events.filter(function (event) { return event instanceof EventInstance; }); });
        var eventInstances = allEventInstances.filter(function (event) { return eventToMatch.name === event.name; });
        return eventInstances[eventInstances.length - 1]; // TODO: sort by day and get the most recent
    };
    Timeline.prototype.printTimeline = function () {
        console.log("Timeline:");
        this.days.forEach(function (day) {
            console.log("Day: " + day.day);
            day.events.forEach(function (event) {
                console.log("Event: " + event.name + " day: " + event.startDay + " status: " + event.getState());
            });
        });
    };
    // Return true if the event has already been completed on a previous day at least once
    Timeline.prototype.hasCompletedInstanceOf = function (scheduledEvent) {
        for (var _i = 0, _a = this.days; _i < _a.length; _i++) {
            var day = _a[_i];
            for (var _b = 0, _c = day.events; _b < _c.length; _b++) {
                var event_1 = _c[_b];
                if (event_1.scheduledEvent.name() === scheduledEvent.name() && event_1.state === TimelineInstanceState.Completed) {
                    return true; // Exit nested loops early if we find a completed instance
                }
            }
        }
        return false;
    };
    Timeline.prototype.numberCompletedInstancesOf = function (scheduledEvent) {
        var count = 0;
        for (var _i = 0, _a = this.days; _i < _a.length; _i++) {
            var day = _a[_i];
            for (var _b = 0, _c = day.events; _b < _c.length; _b++) {
                var event_2 = _c[_b];
                if (event_2.scheduledEvent.name() === scheduledEvent.name() && event_2.state === TimelineInstanceState.Completed) {
                    count++;
                }
            }
        }
        console.log("numberCompletedInstancesOf scheduledEvent: " + scheduledEvent.name() + " is: " + count);
        return count;
    };
    Timeline.prototype.noCompletedInstanceOf = function (scheduledEvent) {
        return !this.hasCompletedInstanceOf(scheduledEvent);
    };
    Timeline.prototype.currentPeriod = function () {
        throw new Error('Method not implemented.');
    };
    return Timeline;
}(core_1.RtObject));
exports.Timeline = Timeline;
var TimelineInstance = /** @class */ (function () {
    function TimelineInstance() {
        this.state = TimelineInstanceState.Active;
    }
    TimelineInstance.prototype.setState = function (state) {
        this.state = state;
    };
    TimelineInstance.prototype.getState = function () {
        return this.state;
    };
    return TimelineInstance;
}());
exports.TimelineInstance = TimelineInstance;
var PeriodInstance = /** @class */ (function (_super) {
    __extends(PeriodInstance, _super);
    function PeriodInstance(scheduledPeriod, startDay) {
        var _this = _super.call(this) || this;
        _this.scheduledPeriod = scheduledPeriod;
        _this.startDay = startDay;
        return _this;
    }
    return PeriodInstance;
}(TimelineInstance));
exports.PeriodInstance = PeriodInstance;
var TimelineInstanceState;
(function (TimelineInstanceState) {
    TimelineInstanceState[TimelineInstanceState["Ready"] = 0] = "Ready";
    TimelineInstanceState[TimelineInstanceState["Scheduled"] = 1] = "Scheduled";
    TimelineInstanceState[TimelineInstanceState["Active"] = 2] = "Active";
    TimelineInstanceState[TimelineInstanceState["Completed"] = 3] = "Completed";
})(TimelineInstanceState || (exports.TimelineInstanceState = TimelineInstanceState = {}));
/*
 * An EventInstance represents an instance of an event on a day on the timeline.
 */
var EventInstance = /** @class */ (function (_super) {
    __extends(EventInstance, _super);
    function EventInstance(scheduledEvent, startDay, startDayOfWindow, endDayOfWindow) {
        var _this = _super.call(this) || this;
        _this.state = TimelineInstanceState.Ready;
        _this.name = scheduledEvent.name();
        _this.startDay = startDay;
        _this.startDayOfWindow = startDayOfWindow !== undefined ? startDay : (startDay !== undefined ? startDay - 1 : undefined);
        _this.endDayOfWindow = endDayOfWindow !== undefined ? endDayOfWindow : (startDay !== undefined ? startDay + 1 : undefined);
        ;
        _this.scheduledEvent = scheduledEvent;
        return _this;
    }
    return EventInstance;
}(TimelineInstance));
exports.EventInstance = EventInstance;
/*
 * A Day represents a day on the timeline and the events that occurred on that day.
 */
var TimelineDay = /** @class */ (function () {
    function TimelineDay(day) {
        this.events = [];
        this.day = day;
    }
    return TimelineDay;
}());
exports.TimelineDay = TimelineDay;
/*
 * A PhaseOccurrence represents a phase of the study that occurred on the timeline.
 */
var PhaseOccurrence = /** @class */ (function () {
    function PhaseOccurrence(name, startEvent, startDay, endDay) {
        this.name = name;
        this.startDay = startDay;
        this.endDay = endDay;
    }
    return PhaseOccurrence;
}());
exports.PhaseOccurrence = PhaseOccurrence;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledPeriod = void 0;
var ScheduledEvent_1 = require("./ScheduledEvent");
var ScheduledPeriod = /** @class */ (function () {
    function ScheduledPeriod(configuredPeriod) {
        this.scheduledEvents = [];
        this.configuredPeriod = configuredPeriod;
        this.scheduledEvents = configuredPeriod.events.map(function (event) { return new ScheduledEvent_1.ScheduledEvent(event); });
    }
    ScheduledPeriod.prototype.getAllScheduledEvents = function () {
        return this.scheduledEvents;
    };
    ScheduledPeriod.prototype.name = function () {
        return this.configuredPeriod.name;
    };
    return ScheduledPeriod;
}());
exports.ScheduledPeriod = ScheduledPeriod;

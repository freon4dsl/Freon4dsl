"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Simulator = void 0;
var Scheduler_js_1 = require("./Scheduler.js");
var Sim = require("../simjs/sim.js");
var SimpleLogger_js_1 = require("../utils/SimpleLogger.js");
var Timeline_js_1 = require("./Timeline.js");
var ScheduledStudyConfiguration_js_1 = require("./ScheduledStudyConfiguration.js");
/*
  * A Simulator is the layer between the Scheduler and the use of the simjs.updated simulation engine. It is an attempt to isolate the TypeScript from the JavaScript and potentially allow a different implementation of the simulation engine.
  * It is responsible for setting up the simulation and running it.
  */
var Simulator = /** @class */ (function () {
    function Simulator(studyConfiguration) {
        this.name = "Simulator";
        // Setup the Scheduler
        this.scheduledStudyConfiguration = new ScheduledStudyConfiguration_js_1.ScheduledStudyConfiguration(studyConfiguration);
        this.timeline = new Timeline_js_1.Timeline();
    }
    Simulator.prototype.getTimeline = function () {
        return this.timeline;
    };
    Simulator.prototype.run = function () {
        // Setup the simulator so it uses the Scheduler and link the Scheduler to this Simulator instance
        // This Scheduler is JavaScript and passing the Simulator instance to it is a way to allow the JavaScript to call back into the TypeScript data structures.
        this.sim = new Sim.Sim();
        this.sim.setLogger(function (s) {
            (0, SimpleLogger_js_1.default)(s);
        });
        this.sim.addEntity(Scheduler_js_1.Scheduler, "Scheduler", this);
        // Run the simulation for the appropriate number of days
        console.log("running simulation...");
        var results = this.sim.simulate(50);
        return results;
    };
    return Simulator;
}());
exports.Simulator = Simulator;

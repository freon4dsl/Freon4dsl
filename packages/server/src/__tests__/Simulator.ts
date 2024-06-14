import { Scheduler } from "./Scheduler.js"
import * as Sim from "../../../playground/src/StudyConfiguration/simjs/sim.js"
import log from "./SimpleLogger.js";
import { Timeline } from "./Timeline";
import { ScheduledEvent } from "./ScheduledEvent";
import {StudyConfiguration, WorkflowDescription, Period, Event, EventSchedule } from "../../../playground/src/StudyConfiguration/language/gen/index";

/*
  * A Simulator is the layer between the Scheduler and the use of the simjs.updated simulation engine. It is an attempt to isolate the TypeScript from the JavaScript and potentially allow a different implementation of the simulation engine.
  * It is responsible for setting up the simulation and running it.
  */

export class Simulator {
  sim: Sim;
  timeline: Timeline;
  events: Event[];
  name = "Simulator";
  scheduledEvents: ScheduledEvent[] = [];

  constructor(studyConfiguration: StudyConfiguration) {
    // Setup the Scheduler
    let periods = studyConfiguration.periods;
    this.events = periods[0].events;
    this.scheduledEvents = this.events.map(event => {return new ScheduledEvent(event)});
    this.timeline = new Timeline();

    // Setup the simulator so it uses the Scheduler and link the Scheduler to this Simulator instance
    // This Scheduler is JavaScript and passing the Simulator instance to it is a way to allow the JavaScript to call back into the TypeScript data structures.
    this.sim = new Sim.Sim();
    this.sim.addEntity(Scheduler, "Scheduler", this);
    this.sim.setLogger(function (s: string) {
       log(s);
    });
  }

  getEvents() {
    return this.scheduledEvents;
  }

  getTimeline() {
    return this.timeline;
  }

  run() {
    // Run the simulation for the appropriate number of days
    let results = this.sim.simulate(50); 
    return results;
  }
  

}

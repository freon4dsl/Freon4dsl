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

  constructor(studyConfiguration: StudyConfiguration) {
    // Setup the Scheduler
    let periods = studyConfiguration.periods;
    let events = periods[0].events;
    let scheduledEvents: ScheduledEvent[] = [];
    scheduledEvents = events.map(event => {return new ScheduledEvent(event)});
    Scheduler.setEvents(scheduledEvents);

    this.timeline = new Timeline();
    Scheduler.setTimeline(this.timeline);

    // Setup the simulator so it uses the Scheduler 
    this.sim = new Sim.Sim();
    this.sim.addEntity(Scheduler);
    this.sim.setLogger(function (str) {
       log(str);
    });
}


  run() {
    // Run the simulation for the appropriate number of days
    let results = this.sim.simulate(50); 
    return results;
  }
  

}

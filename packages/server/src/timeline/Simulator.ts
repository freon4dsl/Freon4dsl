import { Scheduler } from "./Scheduler"
import * as Sim from "../../../playground/src/StudyConfiguration/simjs/sim.js"
import log from "../utils/SimpleLogger";
import { Timeline } from "./Timeline";
import { ScheduledEvent } from "./ScheduledEvent";
import { Day } from "../../../playground/src/StudyConfiguration/language/gen/index";
import {StudyConfiguration, WorkflowDescription, Period, Event, EventSchedule } from "../../../playground/src/StudyConfiguration/language/gen/index";
import { time } from "console";
import { ScheduledPeriod } from "./ScheduledPeriod";
import { ScheduledStudyConfiguration } from "./ScheduledStudyConfiguration";

/*
  * A Simulator is the layer between the Scheduler and the use of the simjs.updated simulation engine. It is an attempt to isolate the TypeScript from the JavaScript and potentially allow a different implementation of the simulation engine.
  * It is responsible for setting up the simulation and running it.
  */

export class Simulator {
  sim: Sim;
  timeline: Timeline;
  events: Event[];
  name = "Simulator";
  studyConfiguration: StudyConfiguration;
  scheduledStudyConfiguration: ScheduledStudyConfiguration

  constructor(studyConfiguration: StudyConfiguration) {
    // Setup the Scheduler
    this.studyConfiguration = studyConfiguration;
    this.scheduledStudyConfiguration = new ScheduledStudyConfiguration(studyConfiguration);
    this.scheduledStudyConfiguration.setupScheduledPeriodsAndEvents();
    // this.setupTimeline();
  }


  // setupTimeline() {
  //   this.timeline = new Timeline();
  //   this.timeline.addEvent(this.getFirstEvent());
  // }

  getTimeline() {
    return this.timeline;
  }

  run() {
    // Setup the simulator so it uses the Scheduler and link the Scheduler to this Simulator instance
    // This Scheduler is JavaScript and passing the Simulator instance to it is a way to allow the JavaScript to call back into the TypeScript data structures.
    this.sim = new Sim.Sim();
    this.sim.addEntity(Scheduler, "Scheduler", this);
    this.sim.setLogger(function (s: string) {
       log(s);
    });    // Run the simulation for the appropriate number of days
    console.log("running simulation");
    let results = this.sim.simulate(50); 
    return results;
  }
  

}

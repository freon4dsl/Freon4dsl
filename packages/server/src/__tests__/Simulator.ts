import { Schedule } from "./Schedule.js"
import * as Sim from "../../../playground/src/StudyConfiguration/simjs/sim.js"
import log from "./SimpleLogger.js";
import { Timeline, ScheduledEvent } from "./Timeline";
import {StudyConfiguration, WorkflowDescription, Period, Event, EventSchedule } from "../../../playground/src/StudyConfiguration/language/gen/index";


export class Simulator {
  sim: Sim;
  timeline: Timeline;

  constructor(studyUnit: StudyConfiguration) {
    this.sim = new Sim.Sim();
    this.timeline = new Timeline();
    let periods = studyUnit.periods;
    let events = periods[0].events;
    let scheduledEvents: ScheduledEvent[] = [];
    console.log("number of events:" + events.length)
    scheduledEvents = events.map(event => {return new ScheduledEvent(event)});
    console.log("number of scheduled events:" + scheduledEvents.length)
    Schedule.setEvents(scheduledEvents); 
    Schedule.setTimeline(this.timeline); 
    this.sim.addEntity(Schedule);
    this.sim.setLogger(function (str) {
       log(str);
    });
}


  run() {
    let results = this.sim.simulate(50); 
    return results;
  }
  

}

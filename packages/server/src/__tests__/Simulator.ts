import { Schedule } from "./Schedule.js"
import * as Sim from "../../../playground/src/StudyConfiguration/simjs/sim.js"
import log from "./SimpleLogger.js";
import { EventSchedule } from "./EventSchedule";


export class Simulator {
  sim: Sim;

  constructor() {
    this.sim = new Sim.Sim();
    let eventSchedule = new EventSchedule();

    Schedule.setVisits(eventSchedule.getVisits());  
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
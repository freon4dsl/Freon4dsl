import { Schedule } from "./Schedule.js"
import * as Sim from "../../../playground/src/StudyConfiguration/simjs/sim.js"
import log from "./SimpleLogger.js";


export class Simulator {
  sim: Sim;

  constructor() {
    this.sim = new Sim.Sim();
    let visits = [
      { name: 'Visit 1', day: 7, repetitions: 0, minWindow: 0, maxWindow: 0, dependency: null },
      { name: 'Visit 2', day: 10, repetitions: 2, minWindow: 2, maxWindow: 4, dependency: null },
      { name: 'Visit 3', day: null, repetitions: 0, minWindow: 2, maxWindow: 2, dependency: 'Visit 2' }
      // Add more visits as needed
    ];
    Schedule.setVisits(visits);  
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
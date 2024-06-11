import { StudyConfigurationModelEnvironment } from "../../../playground/src/StudyConfiguration/config/gen/StudyConfigurationModelEnvironment";  
import {StudyConfiguration, WorkflowDescription, Period, Event, EventSchedule } from "../../../playground/src/StudyConfiguration/language/gen/index";
import { WebformTemplate } from "../../../server/src/templates/WebFormTemplate";
import * as Sim from "../../../playground/src/StudyConfiguration/simjs/sim.js"
import log from "./SimpleLogger.js";
import { Simulator, } from "./Simulator";
import { Timeline, EventInstance, Day } from "./Timeline";

describe("Generate Study Site", () => {

    test(" is able to generate a WebForm YAML file from a model", async () => {
        let model: StudyConfiguration = WebformTemplate.loadModel("Study2");
        WebformTemplate.writeWebForms(model);
    });
});
describe("Simulation of Trial to Generate the Timeline", () => {

    beforeEach(() => {
        new Sim.Sim(); // For some reason, need to do this for Sim to be properly loaded and available in the Scheduler class used by the Simulator.
      });
      
    it.only("generates a one visit timeline", () => {
        const StudyConfiguration = StudyConfigurationModelEnvironment.getInstance();
        const studyModel = StudyConfiguration.newModel("Study1");
        let studyUnit = studyModel.newUnit("StudyConfiguration") as StudyConfiguration;
        let period = new Period("Screening");
        let schedule = new EventSchedule("1");
        console.log("number of events initially:" + period.events.length)
        let event = new Event("Visit 1");
        event.name = "Visit 1"; 
        period.events.push(event);
        studyUnit.periods.push(period);
        let expectedTimeline = new Timeline()
        expectedTimeline.addEvent(new EventInstance("Visit 1", 1));
        let simulator = new Simulator(studyUnit);
        simulator.run();
        let simulatedTimeline = simulator.timeline;
        expect(simulatedTimeline).toEqual(expectedTimeline);
        log("Simulator results:" + simulatedTimeline);      
    });

});

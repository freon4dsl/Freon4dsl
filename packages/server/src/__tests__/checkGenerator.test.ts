import { StudyConfigurationModelEnvironment } from "../../../playground/src/StudyConfiguration/config/gen/StudyConfigurationModelEnvironment";  
import {StudyConfiguration, Period, Event, EventSchedule, Day } from "../../../playground/src/StudyConfiguration/language/gen/index";
import { WebformTemplate } from "../../../server/src/templates/WebFormTemplate";
import * as Sim from "../../../playground/src/StudyConfiguration/simjs/sim.js"
import { Simulator, } from "./Simulator";
import { Timeline, EventInstance, TimelineDay } from "./Timeline";

describe("Generate Study Site", () => {

    test(" is able to generate a WebForm YAML file from a model", async () => {
        let model: StudyConfiguration = WebformTemplate.loadModel("Study2");
        WebformTemplate.writeWebForms(model);
    });
});

describe("Simulation of Trial to Generate the Timeline", () => {

    let studyConfigurationModelEnvironment;
    let studyConfigurationModel;
    let studyConfiguration;
    
    beforeEach(() => {
        new Sim.Sim(); // For some reason, need to do this for Sim to be properly loaded and available in the Scheduler class used by the Simulator.
        studyConfigurationModelEnvironment = StudyConfigurationModelEnvironment.getInstance();
        studyConfigurationModel = studyConfigurationModelEnvironment.newModel("Study1");
        studyConfiguration = studyConfigurationModel.newUnit("StudyConfiguration") as StudyConfiguration;
      });
      
    it.only("generates a one visit timeline", () => {
        // GIVEN a study configuration with one period and one event
        let period = new Period("Screening");
        let schedule = new EventSchedule("ID1");
        let scheduledDay = new Day("ID1");
        scheduledDay.startDay = 1;
        schedule.eventStart = scheduledDay;
        let event = new Event("ID1");
        event.schedule = schedule;
        event.name = "Visit 1"; 
        period.events.push(event);
        studyConfiguration.periods.push(period);

        // WHEN the study is simulated and a timeline is generated
        let simulator = new Simulator(studyConfiguration);
        simulator.run();
        let simulatedTimeline = simulator.timeline;

        // Then the generated timeline has one event on the expected event day
        let expectedTimeline = new Timeline()
        expectedTimeline.addEvent(new EventInstance("Visit 1", 1));

        expect(simulatedTimeline).toEqual(expectedTimeline);  
    });

});

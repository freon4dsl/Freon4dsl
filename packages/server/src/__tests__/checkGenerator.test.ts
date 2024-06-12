import { StudyConfigurationModelEnvironment } from "../../../playground/src/StudyConfiguration/config/gen/StudyConfigurationModelEnvironment";  
import {StudyConfiguration, Period, Event, EventSchedule, Day, BinaryExpression, PlusExpression, When, StartDay, Number } from "../../../playground/src/StudyConfiguration/language/gen/index";
import { WebformTemplate } from "../../../server/src/templates/WebFormTemplate";
import * as Sim from "../../../playground/src/StudyConfiguration/simjs/sim.js"
import { Simulator, } from "./Simulator";
import { Timeline, EventInstance, TimelineDay } from "./Timeline";
import { create } from "lodash";
import { ScheduledEvent } from "./ScheduledEvent";

// function addEventToPeriod(period: Period, eventName: string, startDay: number): Event {
//     let event = new Event(eventName);
//     event.name = eventName; 
//     let eventSchedule = new EventSchedule(eventName + "EventSchedule");
//     let scheduledDay = new Day(eventName + startDay.toString);
//     scheduledDay.startDay = startDay;
//     eventSchedule.eventStart = scheduledDay;
//     event.schedule = eventSchedule;
//     period.events.push(event);
//     return event;
// }

function createWhenEventSchedule(eventName: string, binaryExpression: BinaryExpression) {
    let eventSchedule = new EventSchedule(eventName + binaryExpression.toString());
    let whenExpression = new When(eventName + binaryExpression.toString);
    whenExpression.startWhen = binaryExpression;
    eventSchedule.eventStart = whenExpression;
    return eventSchedule;
}

function createDayEventSchedule(eventName: string, startDay: number) {
    let eventSchedule = new EventSchedule(eventName + "EventSchedule");
    let day = new Day(eventName + startDay.toString);
    day.startDay = startDay;
    eventSchedule.eventStart = day;
    return eventSchedule;
}

function addEventToPeriod(period: Period, eventName: string, eventSchedule: EventSchedule): Event {
    let event = new Event(eventName);
    event.name = eventName; 
    event.schedule = eventSchedule;
    period.events.push(event);
    return event;
}

fdescribe("Generate Study Site", () => {

    test(" is able to generate a WebForm YAML file from a model", async () => {
        let model: StudyConfiguration = WebformTemplate.loadModel("Study2");
        WebformTemplate.writeWebForms(model);
    });
});


describe("Simulation of Trial to Generate the Timeline", () => {

    let studyConfigurationModelEnvironment;
    let studyConfigurationModel;
    let studyConfiguration;

    function createConfigWithAPeriodAndTwoEvents(perionName: string, event1Name: string, event1Day: number, event2Name: string, event2Day ): StudyConfiguration {
        let period = new Period(perionName);
    
        let dayEventSchedule = createDayEventSchedule(event1Name, event1Day);
        addEventToPeriod(period, event1Name, dayEventSchedule);
    
        let when = createWhenEventSchedule(event2Name, PlusExpression.create({left:  new StartDay(), 
                                                                             right: Number.create({value:event2Day})}));
        addEventToPeriod(period, event2Name, when);
    
        studyConfiguration.periods.push(period);
        return studyConfiguration;
    }
    
    beforeEach(() => {
        new Sim.Sim(); // For some reason, need to do this for Sim to be properly loaded and available in the Scheduler class used by the Simulator.
        studyConfigurationModelEnvironment = StudyConfigurationModelEnvironment.getInstance();
        studyConfigurationModel = studyConfigurationModelEnvironment.newModel("Study1");
        studyConfiguration = studyConfigurationModel.newUnit("StudyConfiguration") as StudyConfiguration;
      });
      
    it("generates a one visit timeline for a visit on day 1", () => {
        // GIVEN a study configuration with one period and one event
        let period = new Period("Screening");
        let eventSchedule = createDayEventSchedule("Visit 1", 1);
        addEventToPeriod(period, "Visit 1", eventSchedule);
        studyConfiguration.periods.push(period);

        // WHEN the study is simulated and a timeline is generated
        let simulator = new Simulator(studyConfiguration);
        simulator.run();
        let simulatedTimeline = simulator.timeline;

        // Then the generated timeline has one event on the expected event day
        let expectedTimeline = new Timeline()
        expectedTimeline.addEvent(new EventInstance(new ScheduledEvent(studyConfiguration.periods[0].events[0]), 1));

        expect(simulatedTimeline).toEqual(expectedTimeline);  
    });

    it.only("generates a two visit timeline for a visit 7 days after the end of the first visit", () => {
        // GIVEN a study configuration with one period and two events
        studyConfiguration = createConfigWithAPeriodAndTwoEvents("Screening", "Visit 1", 1, "Visit 2", 7);

        // WHEN the study is simulated and a timeline is generated
        let simulator = new Simulator(studyConfiguration);
        simulator.run();
        let simulatedTimeline = simulator.timeline;

        // Then the generated timeline has two events on the expected event days
        let expectedTimeline = new Timeline()
        expectedTimeline.addEvent(new EventInstance(new ScheduledEvent(studyConfiguration.periods[0].events[0]), 1));
        expectedTimeline.addEvent(new EventInstance(new ScheduledEvent(studyConfiguration.periods[0].events[1]), 8));

        expect(simulatedTimeline).toEqual(expectedTimeline);  
    });

    // it.only("generate a chart for a two visit timeline for a visit 7 days after the end of the first visit"), () => {
    //     // GIVEN a study configuration with one period and two events
    //     studyConfiguration = createConfigWithAPeriodAndTwoEvents("Screening", "Visit 1", 1, "Visit 2", 7);

    //     // WHEN the study is simulated and a timeline picture is generated
    //     let simulator = new Simulator(studyConfiguration);
    //     simulator.run();
    //     let simulatedTimeline = simulator.timeline;
    //     let timelinePicture = simulatedTimeline.generatePicture();

    //     // Then the generated timeline picture has two events on the expected event days
    //     expectedPicture = "";
    //     expect(timelinePicture).toEqual(expectedPicture);

    // } 

});

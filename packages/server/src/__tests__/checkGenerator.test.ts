import { StudyConfigurationModelEnvironment } from "../../../playground/src/StudyConfiguration/config/gen/StudyConfigurationModelEnvironment";  
import {StudyConfiguration, Period, Event, EventSchedule, Day, BinaryExpression, PlusExpression, When, StartDay, Number } from "../../../playground/src/StudyConfiguration/language/gen/index";
import { WebformTemplate } from "../../../server/src/templates/WebFormTemplate";
import * as Sim from "../../../playground/src/StudyConfiguration/simjs/sim.js"
import { Simulator, } from "./Simulator";
import { Timeline, EventInstance, TimelineDay } from "./Timeline";
import { create } from "lodash";
import { ScheduledEvent } from "./ScheduledEvent";
import { TimelineScriptTemplate } from "../templates/TimelineScriptTemplate";

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
        let timeline = simulator.timeline;

        // Then the generated timeline has one event on the expected event day
        let expectedTimeline = new Timeline()
        expectedTimeline.addEvent(new EventInstance(new ScheduledEvent(studyConfiguration.periods[0].events[0]), 1));

        expect(timeline).toEqual(expectedTimeline);  
    });

    it("generates a two visit timeline for a visit 7 days after the end of the first visit", () => {
        // GIVEN a study configuration with one period and two events
        studyConfiguration = createConfigWithAPeriodAndTwoEvents("Screening", "Visit 1", 1, "Visit 2", 7);

        // WHEN the study is simulated and a timeline is generated
        let simulator = new Simulator(studyConfiguration);
        simulator.run();
        let timeline = simulator.timeline;
        console.log("timeline: " + timeline.days.toString);

        // Then the generated timeline has two events on the expected event days
        let expectedTimeline = new Timeline()
        expectedTimeline.addEvent(new EventInstance(new ScheduledEvent(studyConfiguration.periods[0].events[0]), 1));
        expectedTimeline.addEvent(new EventInstance(new ScheduledEvent(studyConfiguration.periods[0].events[1]), 8));

        expect(timeline).toEqual(expectedTimeline);  
    });

    let expectedTimelineDataAsScript = 
`  var groups = new vis.DataSet([
    { "content": "<b>Phase</b>", "id": "Phase", className: 'phase' },
    { "content": "Visit 1", "id": "Visit 1" },
    { "content": "Visit 2", "id": "Visit 2" },
    { "content": "Any Day", "id": "AnyDay", className: 'any-day' },
  ]);

  var items = new vis.DataSet([
    { start: new Date(2024, 0, 1), end: new Date(2024, 0, 6, 23, 59, 59), group: "Phase", className: "screening-phase", title: "tip...", content: "<b>Screening</b>", id: "1" },
    { start: new Date(2024, 0, 7, 0, 1), end: new Date(2024, 0, 30, 23, 59, 59), group: "Phase", className: "treatment-phase", title: "tip...", content: "<b>Treatment<b>", id: "2" },

    { start: new Date(2024, 0, 0), end: new Date(2024, 0, 0, 23, 59, 59), group: "Visit 1", className: "window", title: "Window before Event", content: "&nbsp;", id: "before-0" },
    { start: new Date(2024, 0, 1), end: new Date(2024, 0, 1, 23, 59, 59), group: "Visit 1", className: "treatment-visits", title: "day 1", content: "&nbsp;", id: "0" },
    { start: new Date(2024, 0, 2), end: new Date(2024, 0, 2, 23, 59, 59), group: "Visit 1", className: "window", title: "Window after Event", content: "&nbsp;", id: "after-0" },

    { start: new Date(2024, 0, 7), end: new Date(2024, 0, 7, 23, 59, 59), group: "Visit 2", className: "window", title: "Window before Event", content: "&nbsp;", id: "before-1" },
    { start: new Date(2024, 0, 8), end: new Date(2024, 0, 8, 23, 59, 59), group: "Visit 2", className: "treatment-visits", title: "when Start Day + 7", content: "&nbsp;", id: "1" },
    { start: new Date(2024, 0, 9), end: new Date(2024, 0, 9, 23, 59, 59), group: "Visit 2", className: "window", title: "Window after Event", content: "&nbsp;", id: "after-1" },

    { start: new Date(2024, 0, 6), end: new Date(2024, 0, 30, 23, 59, 59), group: "AnyDay", className: "any-day", title: "Adverse Event", content: "Unscheduled Adverse Event Visit", id: "911" },

  ])
`;

    it.only("generate a chart for a two visit timeline for a visit 7 days after the end of the first visit", () => {
        // GIVEN a study configuration with one period and two events
        studyConfiguration = createConfigWithAPeriodAndTwoEvents("Screening", "Visit 1", 1, "Visit 2", 7);

        // WHEN the study is simulated and a timeline picture is generated
        let simulator = new Simulator(studyConfiguration);
        simulator.run();
        let timeline = simulator.timeline;

        // console.log("timeline: " + timeline.getDays()[0].day);
        // console.log("timeline: " + timeline.getDays()[0].events[0].name);
        let timelineDataAsScript = TimelineScriptTemplate.getTimelineDataAsScript(timeline);
        console.log("timelineDataAsScript: " + timelineDataAsScript);

        // Then the generated timeline picture has two events on the expected event days
        expect(timelineDataAsScript).toEqual(expectedTimelineDataAsScript);

    }); 

});

import * as Sim from "../../../playground/src/StudyConfiguration/simjs/sim.js"
import { Timeline, EventInstance, TimelineDay } from "../timeline/Timeline";
import { Simulator, } from "../timeline/Simulator";
import {StudyConfiguration, Period, Event, EventSchedule, Day, BinaryExpression, PlusExpression, When, StartDay, Number } from "../../../playground/src/StudyConfiguration/language/gen/index";
import * as utils from "./Utils";
import { ScheduledEvent } from "../timeline/ScheduledEvent";
import { TimelineScriptTemplate } from "../templates/TimelineScriptTemplate";

describe ("Access to simulation data", () => {

  var simulator;
  var studyConfiguration: StudyConfiguration;

  beforeAll(() => {
    new Sim.Sim(); // For some reason, need to do this for Sim to be properly loaded and available in the Scheduler class used by the Simulator.
    studyConfiguration = utils.setupEnvironment();
    simulator = new Simulator(studyConfiguration);
  });

  it ("can access to the first period of the trial" , () => {
    // simulator.getFirstScheduledPeriod();
  });
});

describe("Simulation of Trial to Generate the Timeline", () => {

  var studyConfiguration: StudyConfiguration;

  beforeEach(() => {
    new Sim.Sim(); // For some reason, need to do this for Sim to be properly loaded and available in the Scheduler class used by the Simulator.
      studyConfiguration = utils.setupEnvironment();
    });
    
  it("generates a one visit timeline for a visit on day 1", () => {
      // GIVEN a study configuration with one period and one event
      let period = new Period("Screening");
      let eventSchedule = utils.createDayEventSchedule("Visit 1", 1);
      utils.addEventToPeriod(period, "Visit 1", eventSchedule);
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
      studyConfiguration = utils.addAPeriodAndTwoEvents(studyConfiguration, "Screening", "Visit 1", 1, "Visit 2", 7);

      // WHEN the study is simulated and a timeline is generated
      let simulator = new Simulator(studyConfiguration);
      simulator.run();
      let timeline = simulator.timeline;
      // console.log("timeline: " + timeline.days.toString);

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

  { start: new Date(2024, 0, 0), end: new Date(2024, 0, 0, 23, 59, 59), group: "Visit 1", className: "window", title: "Window before Event", content: "&nbsp;", id: "before-Visit 1" },
  { start: new Date(2024, 0, 1), end: new Date(2024, 0, 1, 23, 59, 59), group: "Visit 1", className: "treatment-visits", title: "day 1", content: "&nbsp;", id: "Visit 1" },
  { start: new Date(2024, 0, 2), end: new Date(2024, 0, 2, 23, 59, 59), group: "Visit 1", className: "window", title: "Window after Event", content: "&nbsp;", id: "after-Visit 1" },

  { start: new Date(2024, 0, 7), end: new Date(2024, 0, 7, 23, 59, 59), group: "Visit 2", className: "window", title: "Window before Event", content: "&nbsp;", id: "before-Visit 2" },
  { start: new Date(2024, 0, 8), end: new Date(2024, 0, 8, 23, 59, 59), group: "Visit 2", className: "treatment-visits", title: "when Start Day + 7", content: "&nbsp;", id: "Visit 2" },
  { start: new Date(2024, 0, 9), end: new Date(2024, 0, 9, 23, 59, 59), group: "Visit 2", className: "window", title: "Window after Event", content: "&nbsp;", id: "after-Visit 2" },

  { start: new Date(2024, 0, 6), end: new Date(2024, 0, 30, 23, 59, 59), group: "AnyDay", className: "any-day", title: "Adverse Event", content: "Unscheduled Adverse Event Visit", id: "911" },

])
`;

  it("generate a chart for a two visit timeline for a visit 7 days after the end of the first visit", () => {
      // GIVEN a study configuration with one period and two events
      studyConfiguration = utils.addAPeriodAndTwoEvents(studyConfiguration, "Screening", "Visit 1", 1, "Visit 2", 7);

      // WHEN the study is simulated and a timeline picture is generated
      let simulator = new Simulator(studyConfiguration);
      simulator.run();
      let timeline = simulator.timeline;

      // console.log("timeline: " + timeline.getDays()[0].day);
      // console.log("timeline: " + timeline.getDays()[0].events[0].name);
      let timelineDataAsScript = TimelineScriptTemplate.getTimelineDataAsScript(timeline);
      TimelineScriptTemplate.saveTimeline(timelineDataAsScript);

      // Then the generated timeline picture has two events on the expected event days
      expect(timelineDataAsScript).toEqual(expectedTimelineDataAsScript);
  }); 

});

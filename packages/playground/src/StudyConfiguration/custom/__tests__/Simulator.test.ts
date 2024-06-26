import * as Sim from "../simjs/sim.js"
import { Timeline, EventInstance, TimelineDay, EventInstanceState } from "../timeline/Timeline";
import { Simulator, } from "../timeline/Simulator";
import {StudyConfiguration, Period, Event, EventSchedule, Day, BinaryExpression, PlusExpression, When, StartDay, Number } from "../../language/gen/index";
import * as utils from "./Utils";
import { ScheduledEvent, ScheduledEventState } from "../timeline/ScheduledEvent";
import { TimelineScriptTemplate } from "../templates/TimelineScriptTemplate";
import { EventsToAdd } from "./Utils";


function addScheduledEventAndInstanceToTimeline(studyConfiguration: StudyConfiguration, eventNumber: number, dayEventCompleted: number, timeline: Timeline) {
  let scheduledEvent = new ScheduledEvent(studyConfiguration.periods[0].events[eventNumber]);
  scheduledEvent.state = ScheduledEventState.Scheduled;
  let eventInstance = new EventInstance(scheduledEvent, dayEventCompleted);
  eventInstance.state = EventInstanceState.Completed;
  timeline.addEvent(eventInstance);
  }

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
      let eventSchedule = utils.createEventScheduleStartingOnADay("Visit 1", 1);
      let period = new Period("Screening");
      utils.createEventAndAddToPeriod(period, "Visit 1", eventSchedule);
      studyConfiguration.periods.push(period);

      // WHEN the study is simulated and a timeline is generated
      let simulator = new Simulator(studyConfiguration);
      simulator.run();

      // Then the generated timeline has one event on the expected event day
      let timeline = simulator.timeline;
      let expectedTimeline = new Timeline()
      addScheduledEventAndInstanceToTimeline(studyConfiguration, 0, 1, expectedTimeline)
      expectedTimeline.setCurrentDay(1);

      expect(timeline).toEqual(expectedTimeline);  
  });

  it("generates a two visit timeline with a visit on day 1 and 7", () => {
    // GIVEN a study configuration with one period and two events
    let period = new Period("Screening");
    studyConfiguration.periods.push(period);
    let eventSchedule = utils.createEventScheduleStartingOnADay("Visit 1", 1);
    utils.createEventAndAddToPeriod(period, "Visit 1", eventSchedule);
    eventSchedule = utils.createEventScheduleStartingOnADay("Visit 2", 7);
    utils.createEventAndAddToPeriod(period, "Visit 2", eventSchedule);

    // WHEN the study is simulated and a timeline is generated
    let simulator = new Simulator(studyConfiguration);
    simulator.run();
    let timeline = simulator.timeline;

    // Then the generated timeline has two events on the expected event days
    let expectedTimeline = new Timeline()
    addScheduledEventAndInstanceToTimeline(studyConfiguration, 0, 1, expectedTimeline)
    addScheduledEventAndInstanceToTimeline(studyConfiguration, 1, 7, expectedTimeline)
    expectedTimeline.setCurrentDay(7);

    expect(timeline).toEqual(expectedTimeline);  
});


  it("generates a two visit timeline for a visit 7 days after the study start day", () => {
      // GIVEN a study configuration with one period and two events
      studyConfiguration = utils.addAPeriodAndTwoEvents(studyConfiguration, "Screening", "Visit 1", 1, "Visit 2", 7);

      // WHEN the study is simulated and a timeline is generated
      let simulator = new Simulator(studyConfiguration);
      simulator.run();
      let timeline = simulator.timeline;

      // Then the generated timeline has two events on the expected event days
      let expectedTimeline = new Timeline()
      addScheduledEventAndInstanceToTimeline(studyConfiguration, 0, 1, expectedTimeline)
      addScheduledEventAndInstanceToTimeline(studyConfiguration, 1, 8, expectedTimeline)
      expectedTimeline.setCurrentDay(8);
  
      expect(timeline).toEqual(expectedTimeline);  
  });

  it("generates a two visit timeline for a visit 7 days after the end of the first visit", () => {
    // GIVEN a study configuration with one period and two events
    let listOfEventsToAdd: EventsToAdd[] = [
      { eventName: "Visit 1", eventDay: 1, repeat: 0},
      { eventName: "Visit 2", eventDay: 7, repeat: 0 }
    ];
    studyConfiguration = utils.addEventsScheduledOffCompletedEvents(studyConfiguration, "Screening", listOfEventsToAdd);

    // WHEN the study is simulated and a timeline is generated
    let simulator = new Simulator(studyConfiguration);
    simulator.run();
    let timeline = simulator.timeline;

    // Then the generated timeline has two events on the expected event days
    let expectedTimeline = new Timeline()
    addScheduledEventAndInstanceToTimeline(studyConfiguration, 0, 1, expectedTimeline)
    addScheduledEventAndInstanceToTimeline(studyConfiguration, 1, 8, expectedTimeline)
    expectedTimeline.setCurrentDay(8);

    expect(timeline).toEqual(expectedTimeline);  
  });

  it("generates a three visit timeline for visits 7 days after the end of the previous visit", () => {
    // GIVEN a study configuration with one period and two events
    let listOfEventsToAdd: EventsToAdd[] = [
      { eventName: "Visit 1", eventDay: 1, repeat: 0 },
      { eventName: "Visit 2", eventDay: 7, repeat: 0 },
      { eventName: "Visit 3", eventDay: 7, repeat: 0 }
    ];
    studyConfiguration = utils.addEventsScheduledOffCompletedEvents(studyConfiguration, "Screening", listOfEventsToAdd);

    // WHEN the study is simulated and a timeline is generated
    let simulator = new Simulator(studyConfiguration);
    simulator.run();
    let timeline = simulator.timeline;

    // Then the generated timeline has two events on the expected event days
    let expectedTimeline = new Timeline()
    addScheduledEventAndInstanceToTimeline(studyConfiguration, 0, 1, expectedTimeline);
    addScheduledEventAndInstanceToTimeline(studyConfiguration, 1, 8, expectedTimeline);
    addScheduledEventAndInstanceToTimeline(studyConfiguration, 2, 15, expectedTimeline);
    expectedTimeline.setCurrentDay(15);

    expect(timeline).toEqual(expectedTimeline);  
  });

  // it.only("generates a two visit timeline for a visit that repeats twice", () => {
  //   // GIVEN a study configuration with one period and two events
  //   let listOfEventsToAdd: EventsToAdd[] = [
  //     { eventName: "Visit 1", eventDay: 1, repeat: 2 },
  //   ];
  //   studyConfiguration = utils.addRepeatingEvents(studyConfiguration, "Screening", listOfEventsToAdd);

  //   // WHEN the study is simulated and a timeline is generated
  //   let simulator = new Simulator(studyConfiguration);
  //   simulator.run();
  //   let timeline = simulator.timeline;

  //   // Then the generated timeline has two events on the expected event days
  //   let expectedTimeline = new Timeline()
  //   addScheduledEventAndInstanceToTimeline(studyConfiguration, 0, 1, expectedTimeline)
  //   addScheduledEventAndInstanceToTimeline(studyConfiguration, 1, 8, expectedTimeline)
  //   expectedTimeline.setCurrentDay(8);

  //   expect(timeline).toEqual(expectedTimeline);  
  // });


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

  it.skip("generate a chart for a two visit timeline for a visit 7 days after the end of the first visit", () => {
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

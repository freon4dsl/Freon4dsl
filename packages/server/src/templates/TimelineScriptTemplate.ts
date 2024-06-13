
import { Timeline } from '../__tests__/Timeline';
import {StudyConfigurationModelModelUnitWriter} from '../../../playground/src/StudyConfiguration/writer/gen/StudyConfigurationModelModelUnitWriter';

export class TimelineScriptTemplate {

  static getTimelineDataAsScript(timeline: Timeline): string {
    let writer = new StudyConfigurationModelModelUnitWriter();

    var template = 
`  var groups = new vis.DataSet([
    { "content": "<b>Phase</b>", "id": "Phase", className: 'phase' },${timeline.getDays().map((timelineDay,counter) => timelineDay.events.map((eventInstance) => `
    { "content": "${eventInstance.name}", "id": "${eventInstance.name}" },`).join('')).join('')}
    { "content": "Any Day", "id": "AnyDay", className: 'any-day' },
  ]);

  var items = new vis.DataSet([
    { start: new Date(2024, 0, 1), end: new Date(2024, 0, 6, 23, 59, 59), group: "Phase", className: "screening-phase", title: "tip...", content: "<b>Screening</b>", id: "1" },
    { start: new Date(2024, 0, 7, 0, 1), end: new Date(2024, 0, 30, 23, 59, 59), group: "Phase", className: "treatment-phase", title: "tip...", content: "<b>Treatment<b>", id: "2" },
${timeline.getDays().map((timelineDay, counter) => timelineDay.events.map ((eventInstance) => `
    { start: new Date(2024, 0, ${eventInstance.startDay}), end: new Date(2024, 0, ${eventInstance.startDay}, 23, 59, 59), group: "${eventInstance.name}", className: "window", title: "Window before Event", content: "&nbsp;", id: "before-${counter}" },
    { start: new Date(2024, 0, ${eventInstance.day}), end: new Date(2024, 0, ${eventInstance.day}, 23, 59, 59), group: "${eventInstance.name}", className: "treatment-visits", title: "${writer.writeToString(eventInstance.scheduledEvent.event.schedule.eventStart)}", content: "&nbsp;", id: "${counter}" },
    { start: new Date(2024, 0, ${eventInstance.endDay}), end: new Date(2024, 0, ${eventInstance.endDay}, 23, 59, 59), group: "${eventInstance.name}", className: "window", title: "Window after Event", content: "&nbsp;", id: "after-${counter}" },
`).join('')).join('')}
    { start: new Date(2024, 0, 6), end: new Date(2024, 0, 30, 23, 59, 59), group: "AnyDay", className: "any-day", title: "Adverse Event", content: "Unscheduled Adverse Event Visit", id: "911" },

  ])
`
    return template;
  }
}
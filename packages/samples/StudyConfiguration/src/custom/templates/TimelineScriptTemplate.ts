
import { EventInstance, Timeline } from '../timeline/Timeline';
import {StudyConfigurationModelModelUnitWriter} from '../../writer/gen/StudyConfigurationModelModelUnitWriter';
import { writeFileSync } from 'fs';

export class TimelineScriptTemplate {

  static getTimelineDataAsScript(timeline: Timeline): string {
    let writer = new StudyConfigurationModelModelUnitWriter();

    var template = 
`  var groups = new vis.DataSet([
    { "content": "<b>Phase</b>", "id": "Phase", className: 'phase' },${timeline.getDays().map((timelineDay,counter) => timelineDay.getPeriodInstances().map((periodInstance) => `
    { "content": "${periodInstance.getName()}", "id": "${periodInstance.getName()}" },`).join('')).join('')}
    { "content": "Any Day", "id": "AnyDay", className: 'any-day' },
  ]);

  var items = new vis.DataSet([
    { start: new Date(2024, 0, 1), end: new Date(2024, 0, 6, 23, 59, 59), group: "Phase", className: "screening-phase", title: "tip...", content: "<b>Screening</b>", id: "1" },
    { start: new Date(2024, 0, 7, 0, 1), end: new Date(2024, 0, 30, 23, 59, 59), group: "Phase", className: "treatment-phase", title: "tip...", content: "<b>Treatment<b>", id: "2" },
${timeline.getDays().map((timelineDay, counter) => timelineDay.getEventInstances().map ((eventInstance) => `
    { start: new Date(2024, 0, ${eventInstance.startDayOfWindow}), end: new Date(2024, 0, ${eventInstance.startDay}, 23, 59, 59), group: "${eventInstance.getName()}", className: "window", title: "Window before Event", content: "&nbsp;", id: "before-${eventInstance.getName()}" },
    { start: new Date(2024, 0, ${eventInstance.startDay}), end: new Date(2024, 0, ${eventInstance.startDay}, 23, 59, 59), group: "${eventInstance.getName()}", className: "treatment-visits", title: "${writer.writeToString((eventInstance as EventInstance).scheduledEvent.configuredEvent.schedule.eventStart)}", content: "&nbsp;", id: "${eventInstance.getName()}" },
    { start: new Date(2024, 0, ${(eventInstance as EventInstance).endDayOfWindow}), end: new Date(2024, 0, ${(eventInstance as EventInstance).endDayOfWindow}, 23, 59, 59), group: "${eventInstance.getName()}", className: "window", title: "Window after Event", content: "&nbsp;", id: "after-${eventInstance.getName()}" },
`).join('')).join('')}
    { start: new Date(2024, 0, 6), end: new Date(2024, 0, 30, 23, 59, 59), group: "AnyDay", className: "any-day", title: "Adverse Event", content: "Unscheduled Adverse Event Visit", id: "911" },

  ])
`
    return template;
  }

  static getTimelineHTML(timelineDataAsScript: string): string {
    return `<!DOCTYPE HTML>
<html>
<head>
  <title>Timeline | groups | Editable Groups</title>

  <style>
    body, html {
      font-family: arial, sans-serif;
      font-size: 11pt;
    }

    #visualization {
      box-sizing: border-box;
      width: 100%;
      height: 300px;
    }
    
    .vis-item.screen  { background-color: #B0E2FF; }
    .vis-item.v2      { background-color: #EAEAEA; }
    .vis-item.v3 { background-color: #FA8072; }
    .vis-item.screening-phase { background-color: #5ceb5c; }
    .vis-item.treatment-phase { background-color: #9370ed; }
    .vis-item.v5  { background-color: #FFFFCC; }
    .vis-item.window  { background-color: #c3c3be; }
    .vis-item.screening-visits  { background-color: #bceebc; }
    .vis-item.treatment-visits  { background-color: #ccbcf4; }
    .vis-item.any-day  { background-color: #95a89a; }

    
  </style>

<script type="text/javascript" src="https://unpkg.com/vis-timeline@latest/standalone/umd/vis-timeline-graph2d.min.js"></script>
<link href="https://unpkg.com/vis-timeline@latest/styles/vis-timeline-graph2d.min.css" rel="stylesheet" type="text/css" />
<!--    -->
</head>
<body>
<h1>
  Study Timeline
</h1>
<div id="visualization"></div>

<script>
  ${timelineDataAsScript}
 
  // create visualization
  var container = document.getElementById('visualization');
  var options = {
    format: {
        minorLabels: {
            millisecond:'',
            second:     '',
            minute:     '',
            hour:       '',
            weekday:    '',
            day:        'DDD',
            week:       '',
            month:      '',
            year:       ''
        },
    },
    timeAxis: {scale: 'day', step: 1},
    showMajorLabels: false,
    orientation: 'both',
    start: new Date(2024, 0, 1),
    end: new Date(2024, 0, 30, 23, 59, 59),
    min: new Date(2024, 0, 1),
    max: new Date(2024, 0, 30, 23, 59, 59),
    margin: {
        item: {
            horizontal: 0,
        },
    },
  };

  var timeline = new vis.Timeline(container);
  timeline.setOptions(options);
  timeline.setGroups(groups);
  timeline.setItems(items);

</script>
</body>
</html>

    `;
  }

  static saveTimelineHTML(timelineDataAsHTML: string, filename: string) {
    try {
      writeFileSync(filename, timelineDataAsHTML);
      console.log('File written successfully');
    } catch (err) {
      console.error('Error writing file:', err);
    }
  }
  
  static saveTimeline(timelineDataAsScript: string) {
    let filename = 'timeline.html';
    let timelineDataAsHTML = TimelineScriptTemplate.getTimelineHTML(timelineDataAsScript);
    this.saveTimelineHTML(timelineDataAsHTML, filename);
  }

}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelineScriptTemplate = void 0;
var StudyConfigurationModelModelUnitWriter_1 = require("../../writer/gen/StudyConfigurationModelModelUnitWriter");
var fs_1 = require("fs");
var TimelineScriptTemplate = /** @class */ (function () {
    function TimelineScriptTemplate() {
    }
    TimelineScriptTemplate.getTimelineDataAsScript = function (timeline) {
        var writer = new StudyConfigurationModelModelUnitWriter_1.StudyConfigurationModelModelUnitWriter();
        var template = "  var groups = new vis.DataSet([\n    { \"content\": \"<b>Phase</b>\", \"id\": \"Phase\", className: 'phase' },".concat(timeline.getDays().map(function (timelineDay, counter) { return timelineDay.events.map(function (eventInstance) { return "\n    { \"content\": \"".concat(eventInstance.name, "\", \"id\": \"").concat(eventInstance.name, "\" },"); }).join(''); }).join(''), "\n    { \"content\": \"Any Day\", \"id\": \"AnyDay\", className: 'any-day' },\n  ]);\n\n  var items = new vis.DataSet([\n    { start: new Date(2024, 0, 1), end: new Date(2024, 0, 6, 23, 59, 59), group: \"Phase\", className: \"screening-phase\", title: \"tip...\", content: \"<b>Screening</b>\", id: \"1\" },\n    { start: new Date(2024, 0, 7, 0, 1), end: new Date(2024, 0, 30, 23, 59, 59), group: \"Phase\", className: \"treatment-phase\", title: \"tip...\", content: \"<b>Treatment<b>\", id: \"2\" },\n").concat(timeline.getDays().map(function (timelineDay, counter) { return timelineDay.events.map(function (eventInstance) { return "\n    { start: new Date(2024, 0, ".concat(eventInstance.startDayOfWindow, "), end: new Date(2024, 0, ").concat(eventInstance.startDay, ", 23, 59, 59), group: \"").concat(eventInstance.name, "\", className: \"window\", title: \"Window before Event\", content: \"&nbsp;\", id: \"before-").concat(eventInstance.name, "\" },\n    { start: new Date(2024, 0, ").concat(eventInstance.startDay, "), end: new Date(2024, 0, ").concat(eventInstance.startDay, ", 23, 59, 59), group: \"").concat(eventInstance.name, "\", className: \"treatment-visits\", title: \"").concat(writer.writeToString(eventInstance.scheduledEvent.configuredEvent.schedule.eventStart), "\", content: \"&nbsp;\", id: \"").concat(eventInstance.name, "\" },\n    { start: new Date(2024, 0, ").concat(eventInstance.endDayOfWindow, "), end: new Date(2024, 0, ").concat(eventInstance.endDayOfWindow, ", 23, 59, 59), group: \"").concat(eventInstance.name, "\", className: \"window\", title: \"Window after Event\", content: \"&nbsp;\", id: \"after-").concat(eventInstance.name, "\" },\n"); }).join(''); }).join(''), "\n    { start: new Date(2024, 0, 6), end: new Date(2024, 0, 30, 23, 59, 59), group: \"AnyDay\", className: \"any-day\", title: \"Adverse Event\", content: \"Unscheduled Adverse Event Visit\", id: \"911\" },\n\n  ])\n");
        return template;
    };
    TimelineScriptTemplate.getTimelineHTML = function (timelineDataAsScript) {
        return "<!DOCTYPE HTML>\n<html>\n<head>\n  <title>Timeline | groups | Editable Groups</title>\n\n  <style>\n    body, html {\n      font-family: arial, sans-serif;\n      font-size: 11pt;\n    }\n\n    #visualization {\n      box-sizing: border-box;\n      width: 100%;\n      height: 300px;\n    }\n    \n    .vis-item.screen  { background-color: #B0E2FF; }\n    .vis-item.v2      { background-color: #EAEAEA; }\n    .vis-item.v3 { background-color: #FA8072; }\n    .vis-item.screening-phase { background-color: #5ceb5c; }\n    .vis-item.treatment-phase { background-color: #9370ed; }\n    .vis-item.v5  { background-color: #FFFFCC; }\n    .vis-item.window  { background-color: #c3c3be; }\n    .vis-item.screening-visits  { background-color: #bceebc; }\n    .vis-item.treatment-visits  { background-color: #ccbcf4; }\n    .vis-item.any-day  { background-color: #95a89a; }\n\n    \n  </style>\n\n<script type=\"text/javascript\" src=\"https://unpkg.com/vis-timeline@latest/standalone/umd/vis-timeline-graph2d.min.js\"></script>\n<link href=\"https://unpkg.com/vis-timeline@latest/styles/vis-timeline-graph2d.min.css\" rel=\"stylesheet\" type=\"text/css\" />\n<!--    -->\n</head>\n<body>\n<h1>\n  Study Timeline\n</h1>\n<div id=\"visualization\"></div>\n\n<script>\n  ".concat(timelineDataAsScript, "\n \n  // create visualization\n  var container = document.getElementById('visualization');\n  var options = {\n    format: {\n        minorLabels: {\n            millisecond:'',\n            second:     '',\n            minute:     '',\n            hour:       '',\n            weekday:    '',\n            day:        'DDD',\n            week:       '',\n            month:      '',\n            year:       ''\n        },\n    },\n    timeAxis: {scale: 'day', step: 1},\n    showMajorLabels: false,\n    orientation: 'both',\n    start: new Date(2024, 0, 1),\n    end: new Date(2024, 0, 30, 23, 59, 59),\n    min: new Date(2024, 0, 1),\n    max: new Date(2024, 0, 30, 23, 59, 59),\n    margin: {\n        item: {\n            horizontal: 0,\n        },\n    },\n  };\n\n  var timeline = new vis.Timeline(container);\n  timeline.setOptions(options);\n  timeline.setGroups(groups);\n  timeline.setItems(items);\n\n</script>\n</body>\n</html>\n\n    ");
    };
    TimelineScriptTemplate.saveTimelineHTML = function (timelineDataAsHTML, filename) {
        try {
            (0, fs_1.writeFileSync)(filename, timelineDataAsHTML);
            console.log('File written successfully');
        }
        catch (err) {
            console.error('Error writing file:', err);
        }
    };
    TimelineScriptTemplate.saveTimeline = function (timelineDataAsScript) {
        var filename = 'timeline.html';
        var timelineDataAsHTML = TimelineScriptTemplate.getTimelineHTML(timelineDataAsScript);
        this.saveTimelineHTML(timelineDataAsHTML, filename);
    };
    return TimelineScriptTemplate;
}());
exports.TimelineScriptTemplate = TimelineScriptTemplate;


export class TimelineScriptTemplate {

  static getScriptTemplate(timeline, ): string {
          var template = `var groups = new vis.DataSet([${timeline.map ((a, counter) => `
      { "content": "<b>Phase</b>", "id": "Phase", "value": 0, className: 'phase' },
      { "content": "Screen", "id": "Screen", "value": 1, className: 'screen' },
      { "content": "V2", "id": "V2", "value": 2, className: 'v2' },
      { "content": "V3", "id": "V3", "value": 3, className: 'v3' },
      { "content": "V4", "id": "V4", "value": 3, className: 'v4' },
      { "content": "V5", "id": "V5", "value": 3, className: 'v5' },
      { "content": "Any Day", "id": "AnyDay", "value": 3, className: 'any-day' },
    ]);`
    )}
    var groups = new vis.DataSet([${timeline.map ((a, counter) => `var items = new vis.DataSet([
      { start: new Date(2024, 0, 1), end: new Date(2024, 0, 6, 23, 59, 59), group: "Phase", className: "screening-phase", title: "tip...", content: "<b>Screening</b>", id: "1" },
      { start: new Date(2024, 0, 7, 0, 1), end: new Date(2024, 0, 30, 23, 59, 59), group: "Phase", className: "treatment-phase", title: "tip...", content: "<b>Treatment<b>", id: "2" },

      { start: new Date(2024, 0, 1), end: new Date(2024, 0, 1, 23, 59, 59), group: "Screen", className: "screening-visits", title: "Screening visit defines day 1 for the subject", content: "&nbsp", id: "112" },
      { start: new Date(2024, 0, 2), end: new Date(2024, 0, 6, 23, 59, 59), group: "Screen", className: "window", title: "Re-Screening visit can happen within 6 days of initial screen", content: "&nbsp", id: "113" },

      { start: new Date(2024, 0, 6), end: new Date(2024, 0, 6, 23, 59, 59), group: "V2", className: "window", title: "Visit can start 1 day before", content: "&nbsp;", id: "211" },
      { start: new Date(2024, 0, 7), end: new Date(2024, 0, 7, 23, 59, 59), group: "V2", className: "treatment-visits", title: "Visit scheduled for day 7", content: "&nbsp;", id: "212" },
      { start: new Date(2024, 0, 8), end: new Date(2024, 0, 8, 23, 59, 59), group: "V2", className: "window", title: "Screening visit is allow up to one day after", content: "&nbsp;", id: "213" },

      { start: new Date(2024, 0, 12), end: new Date(2024, 0, 13, 23, 59, 59), group: "V3", className: "window", title: "Visit can start 2 day before", content: "&nbsp;", id: "311" },
      { start: new Date(2024, 0, 14), end: new Date(2024, 0, 14, 23, 59, 59), group: "V3", className: "treatment-visits", title: "Visit scheduled for day 14", content: "&nbsp", id: "312" },
      { start: new Date(2024, 0, 15), end: new Date(2024, 0, 16, 23, 59, 59), group: "V3", className: "window", title: "Screening visit is allow up to 2 days after", content: "&nbsp;", id: "313" },

      { start: new Date(2024, 0, 21), end: new Date(2024, 0, 21, 23, 59, 59), group: "V3", className: "window", title: "Visit can start 2 day before", content: "&nbsp;", id: "314" },
      { start: new Date(2024, 0, 22), end: new Date(2024, 0, 22, 23, 59, 59), group: "V3", className: "treatment-visits", title: "Visit scheduled for day 14", content: "&nbsp", id: "315" },
      { start: new Date(2024, 0, 23), end: new Date(2024, 0, 23, 23, 59, 59), group: "V3", className: "window", title: "Screening visit is allow up to 2 days after", content: "&nbsp;", id: "316" },

      { start: new Date(2024, 0, 19), end: new Date(2024, 0, 20, 23, 59, 59), group: "V4", className: "window", title: "Visit can start 3 day before", content: "&nbsp;", id: "411" },
      { start: new Date(2024, 0, 21), end: new Date(2024, 0, 21, 23, 59, 59), group: "V4", className: "treatment-visits", title: "Visit scheduled for day 21", content: "&nbsp", id: "412" },
      { start: new Date(2024, 0, 22), end: new Date(2024, 0, 23, 23, 59, 59), group: "V4", className: "window", title: "Screening visit is allow up to 3 days after", content: "&nbsp;", id: "413" },

      { start: new Date(2024, 0, 27), end: new Date(2024, 0, 27, 23, 59, 59), group: "V5", className: "window", title: "Visit can start 1 day before", content: "&nbsp;", id: "511" },
      { start: new Date(2024, 0, 28), end: new Date(2024, 0, 28, 23, 59, 59), group: "V5", className: "treatment-visits", title: "Visit scheduled for day 28", content: "&nbsp", id: "512" },
      { start: new Date(2024, 0, 29), end: new Date(2024, 0, 29, 23, 59, 59), group: "V5", className: "window", title: "Screening visit is allow up to one day after", content: "&nbsp;", id: "513" },

      { start: new Date(2024, 0, 6), end: new Date(2024, 0, 30, 23, 59, 59), group: "AnyDay", className: "any-day", title: "Adverse Event", content: "Unscheduled Adverse Event Visit", id: "911" },

    ])`
    )}`
    return template;
  }
}
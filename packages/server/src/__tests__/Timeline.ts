import { ScheduledEvent } from './ScheduledEvent';

/*
 * A Timeline records the events and the days they occur on.
 */
export class Timeline {
  days: TimelineDay[] = [];

  constructor() {
  }

  // newEventInstance(name?: string, day?: number, startDay?: number, endDay?: number) {
  //   return new EventInstance(name, day, startDay, endDay);
  // }

  getDays() {
    return this.days;
  }

  newEventInstance(scheduledEvent:ScheduledEvent, day: number, startDay?: number, endDay?: number) {
    return new EventInstance(scheduledEvent, day, startDay, endDay);
  }

  addEvent(event: EventInstance) {
    let day = this.days.find(d => d.day === event.day);
    if (!day) {
      day = new TimelineDay(event.day);
      this.days.push(day);
    }
    day.events.push(event);
  }

  getEvents(day: number) {
    let timelineDay = this.days.find(d => d.day === day);
    return timelineDay ? timelineDay.events : [];
  }
}

 /*
  * An EventInstance represents an instance of an event on a day on the timeline.
  */
export class EventInstance {
  name: string;
  day: number;      // The day the event occurred on
  startDay: number; // The day the window of the event was scheduled to start
  endDay: number;   // The day the window of the event was scheduled to end
  scheduledEvent: ScheduledEvent; // The scheduled event that this instance was created from

  constructor(scheduledEvent: ScheduledEvent, day?: number, startDay?: number, endDay?: number) {
    this.name = scheduledEvent.name();
    this.day = day;
    this.startDay = startDay !== undefined ? startDay : (day !== undefined ? day - 1 : undefined);
    this.endDay = endDay !== undefined ? endDay : (day !== undefined ? day + 1 : undefined);;
    this.scheduledEvent = scheduledEvent;
  }
}

/*
 * A Day represents a day on the timeline and the events that occurred on that day.
 */
export class TimelineDay {
  day: number;
  events: EventInstance[] = [];

  constructor(day: number) {
    this.day = day;
  }
}



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

  newEventInstance(scheduledEvent:ScheduledEvent, day?: number, startDay?: number, endDay?: number) {
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
  day: number;
  startDay: number;
  endDay: number;
  scheduledEvent: ScheduledEvent;

  constructor(scheduledEvent: ScheduledEvent,day?: number, startDay?: number, endDay?: number) {
    this.name = scheduledEvent.name();
    this.day = day;
    this.startDay = startDay;
    this.endDay = endDay;
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



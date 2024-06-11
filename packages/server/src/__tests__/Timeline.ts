import { Event } from "../../../playground/src/StudyConfiguration/language/gen/index";

export class EventInstance {
  name: string;
  day: number;
  startDay: number;
  endDay: number;

  constructor(name?: string, day?: number, startDay?: number, endDay?: number) {
    this.name = name;
    this.day = day;
    this.startDay = startDay;
    this.endDay = endDay;
  }


}

export class ScheduledEvent {
  event: Event;
  
  constructor(event: Event) {
    this.event = event;
  }

  day():number {
    return 1;
  }

  name():string {
    return this.event.name;
  } 

  dependency(): string {
    return null;
  }
}

export class Day {
  day: number;
  events: EventInstance[] = [];

  constructor(day: number) {
    this.day = day;
  }
}

export class Timeline {
  days: Day[] = [];

  constructor() {
  }

  newEventInstance(name?: string, day?: number, startDay?: number, endDay?: number) {
    return new EventInstance(name, day, startDay, endDay);
  }

  addEvent(event: EventInstance) {
    let day = this.days.find(d => d.day === event.day);
    if (!day) {
      day = new Day(event.day);
      this.days.push(day);
    }
    day.events.push(event);
  }

  getEvents(day: number) {
    let timelineDay = this.days.find(d => d.day === day);
    return timelineDay ? timelineDay.events : [];
  }
}


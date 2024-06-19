import { RtBoolean, RtObject } from '@freon4dsl/core';
import { ScheduledEvent } from './ScheduledEvent';

/*
 * A Timeline records the events and the days they occur on.
 */
export class Timeline extends RtObject{

  days: TimelineDay[] = [];
  phaseOccurrences: PhaseOccurrence[] = [];
  currentDay: number = 0;

  constructor() {
    super();
  }

  equals(other: RtObject): RtBoolean {
    throw new Error('Timelines are not comparable. Method not implemented.');
  }

  // newEventInstance(name?: string, day?: number, startDay?: number, endDay?: number) {
  //   return new EventInstance(name, day, startDay, endDay);
  // }

  getDays() {
    return this.days;
  }

  moveToNextDay() {
    this.currentDay++;
  }

  setCurrentDay(day: number) { 
    this.currentDay = day;
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

  getLastInstanceForThisEvent(scheduledEvent: ScheduledEvent): EventInstance {
    let allEventInstances = this.days.flatMap(day => day.events);
    let eventInstances = allEventInstances.filter(event => event.scheduledEvent.name === scheduledEvent.name);
    return eventInstances[eventInstances.length - 1]; // TODO: sort by day and get the most recent
  }

  // Return true if the event has already been completed on a previous day at least once
  hasCompletedInstanceOf(scheduledEvent: ScheduledEvent) {
    return this.days.some(day => day.events.some(event => event.scheduledEvent === scheduledEvent && event.status === EventInstanceState.Completed));
  }
}

export enum EventInstanceState {
  Ready,
  Active,
  Completed
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
  status : EventInstanceState = EventInstanceState.Ready;

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

/*
 * A PhaseOccurrence represents a phase of the study that occurred on the timeline.
 */
export class PhaseOccurrence {
  name: string;
  startDay: number;
  endDay: number;
  startEvent: EventInstance;

  constructor(name: string, startEvent: EventInstance, startDay: number, endDay: number) {
    this.name = name;
    this.startDay = startDay;
    this.endDay = endDay;
  }
}



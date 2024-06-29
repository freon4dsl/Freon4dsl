import { RtBoolean, RtObject } from '@freon4dsl/core';
import { ScheduledEvent, ScheduledEventState } from './ScheduledEvent';
import { Event } from '../../language/gen/index';

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

  newEventInstance(scheduledEvent: ScheduledEvent, dayEventWillOccurOn?: number, startDay?: number, endDay?: number) {
    return new EventInstance(scheduledEvent, dayEventWillOccurOn, startDay, endDay);
  }

  getDays() {
    return this.days;
  }

  moveToNextDay() {
    this.currentDay++;
  }

  setCurrentDay(day: number) { 
    this.currentDay = day;
  }

  // wrapper so Scheduler can set event statuses
  setCompleted(completedEvent) {
      completedEvent.state = EventInstanceState.Completed;
  }

  setScheduled(eventInstance) {
    eventInstance.state = EventInstanceState.Scheduled;
    eventInstance.scheduledEvent.setState(ScheduledEventState.Scheduled);
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

  getLastInstanceForThisEvent(eventToMatch: Event): EventInstance {
    let allEventInstances = this.days.flatMap(day => day.events);
    let eventInstances = allEventInstances.filter(event => eventToMatch.name === event.name);
    return eventInstances[eventInstances.length - 1]; // TODO: sort by day and get the most recent
  }

  printTimeline() {
    console.log("Timeline:");
    this.days.forEach(day => {
      console.log("Day: " + day.day);
      day.events.forEach(event => {
        console.log("Event: " + event.name + " day: " + event.day + " status: " + event.getState() );
      });
    });
  }

  // Return true if the event has already been completed on a previous day at least once
  hasCompletedInstanceOf(scheduledEvent: ScheduledEvent) {
    for (const day of this.days) {
      for (const event of day.events) {
        if (event.scheduledEvent.name() === scheduledEvent.name() && event.state === EventInstanceState.Completed) {
          return true; // Exit nested loops early if we find a completed instance
        }
      }
    }    
    return false;
  }

  numberCompletedInstancesOf(scheduledEvent: ScheduledEvent) {
    let count = 0;
    for (const day of this.days) {
      for (const event of day.events) {
        if (event.scheduledEvent.name() === scheduledEvent.name() && event.state === EventInstanceState.Completed) {
          count++;
        }
      }
    }
    console.log("numberCompletedInstancesOf scheduledEvent: " + scheduledEvent.name() + " is: " + count);    
    return count;
  }

  noCompletedInstanceOf(scheduledEvent: ScheduledEvent) {
    return !this.hasCompletedInstanceOf(scheduledEvent);
  }
}

export enum EventInstanceState {
  Ready,
  Scheduled,
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
  state : EventInstanceState = EventInstanceState.Ready;

  constructor(scheduledEvent: ScheduledEvent, day?: number, startDay?: number, endDay?: number) {
    this.name = scheduledEvent.name();
    this.day = day;
    this.startDay = startDay !== undefined ? startDay : (day !== undefined ? day - 1 : undefined);
    this.endDay = endDay !== undefined ? endDay : (day !== undefined ? day + 1 : undefined);;
    this.scheduledEvent = scheduledEvent;
  }

  setState(state: EventInstanceState) {
    this.state = state;
  }

  getState() {
    return this.state;
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



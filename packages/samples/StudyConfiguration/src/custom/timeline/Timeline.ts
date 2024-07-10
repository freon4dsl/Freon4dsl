import { RtBoolean, RtObject } from '@freon4dsl/core';
import { ScheduledEvent, ScheduledEventState } from './ScheduledEvent';
import { Event } from '../../language/gen/index';
import { ScheduledPeriod } from './ScheduledPeriod';
import { ScheduledStudyConfiguration } from './ScheduledStudyConfiguration';

/*
 * A Timeline records the events and the days they occur on.
 */
export class Timeline extends RtObject{

  days: TimelineDay[] = [];
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

  getEventsForDay(day: number) {
    return this.days.find(d => d.day === day).events.map(event => {event instanceof(EventInstance)});
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
      completedEvent.state = TimelineInstanceState.Completed;
  }

  setScheduled(eventInstance) {
    eventInstance.state = TimelineInstanceState.Scheduled;
    eventInstance.scheduledEvent.setState(ScheduledEventState.Scheduled);
  }

  addEvent(event: TimelineInstance) {
    let day = this.days.find(d => d.day === event.startDay);
    if (!day) {
      day = new TimelineDay(event.startDay);
      this.days.push(day);
    }
    day.events.push(event);
  }

  getEvents(day: number) {
    let timelineDay = this.days.find(d => d.day === day);
    return timelineDay ? timelineDay.events : [];
  }

  getLastInstanceForThisEvent(eventToMatch: Event): EventInstance {
    let allEventInstances = this.days.flatMap(day => day.events.filter ( event => event instanceof EventInstance));
    let eventInstances = allEventInstances.filter(event => eventToMatch.name === event.getName());
    return eventInstances[eventInstances.length - 1] as EventInstance; // TODO: sort by day and get the most recent
  }

  printTimeline() {
    console.log("Timeline:");
    this.days.forEach(day => {
      console.log("Day: " + day.day);
      day.events.forEach(event => {
        console.log("Event: " + event.getName() + " day: " + event.startDay + " status: " + event.getState() );
      });
    });
  }

  // Return true if the event has already been completed on a previous day at least once
  hasCompletedInstanceOf(scheduledEvent: ScheduledEvent) {
    for (const day of this.days) {
      for (const event of day.events) {
        if (event instanceof(EventInstance)) {
          let eventInstance = event as EventInstance;
          console.log("hasCompletedInstanceOf scheduledEvent: " + scheduledEvent.getName() + " event: " + eventInstance.getName() + " state: " + eventInstance.state + " day: " + day.day);
          if (eventInstance.scheduledEvent.getName() === scheduledEvent.getName() && event.state === TimelineInstanceState.Completed) {
            return true; // Exit nested loops early if we find a completed instance
          }
        }
      }
    }    
    return false;
  }

  numberCompletedInstancesOf(scheduledEvent: ScheduledEvent) {
    // what happens when event is a period
    let count = 0;
    for (const day of this.days) {
      for (const event of day.events) {
        if (event instanceof(EventInstance) && event.scheduledEvent.getName() === scheduledEvent.getName() && event.state === TimelineInstanceState.Completed) {
          count++;
        }
      }
    }
    console.log("numberCompletedInstancesOf scheduledEvent: " + scheduledEvent.getName() + " is: " + count);    
    return count;
  }

  noCompletedInstanceOf(scheduledEvent: ScheduledEvent) {
    return !this.hasCompletedInstanceOf(scheduledEvent);
  }

  getPeriods() {
    return this.days.flatMap(day => day.events.filter(event => event instanceof PeriodInstance));
  }

  getPeriodInstanceFor(scheduledPeriodName: string) {
    return this.getPeriods().find(period => (period as PeriodInstance).scheduledPeriod.getName() === scheduledPeriodName) as PeriodInstance;
  }

  // Return the first period that is active. There should be only one.
  getCurrentPeriod(): PeriodInstance {
    let firstActivePeriodOnTimeline = this.getPeriods().find(period => (period as PeriodInstance).getState() === TimelineInstanceState.Active) as PeriodInstance;
    if (firstActivePeriodOnTimeline) {
      console.log("getCurrentPeriod firstActivePeriodOnTimeline: " + firstActivePeriodOnTimeline.getName());
    } else {
      console.log("getCurrentPeriod no active period found");
    }
    return firstActivePeriodOnTimeline;
  }

}


export abstract class TimelineInstance {
  startDay: number;      // The day the event occurred on
  state: TimelineInstanceState = TimelineInstanceState.Active;

  setState(state: TimelineInstanceState) {
    this.state = state;
  }

  getState() {
    return this.state;
  }

  abstract getName(): string;

}

export class PeriodInstance extends TimelineInstance {

  scheduledPeriod: ScheduledPeriod;

  
  constructor(scheduledPeriod: ScheduledPeriod, startDay: number) {
    super();
    this.scheduledPeriod = scheduledPeriod;
    this.startDay = startDay;
    this.setState(TimelineInstanceState.Active);
  } 

  getName() {
    return this.scheduledPeriod.getName();
  }
}

export enum TimelineInstanceState {
  Ready,
  Scheduled,
  Active,
  Completed
}

 /*
  * An EventInstance represents an instance of an event on a day on the timeline.
  */
export class EventInstance extends TimelineInstance {

  startDayOfWindow: number; // The day the window of the event was scheduled to start
  endDayOfWindow: number;   // The day the window of the event was scheduled to end
  scheduledEvent: ScheduledEvent; // The scheduled event that this instance was created from
  state : TimelineInstanceState = TimelineInstanceState.Ready;

  constructor(scheduledEvent: ScheduledEvent, startDay?: number, startDayOfWindow?: number, endDayOfWindow?: number) {
    super();
    this.startDay = startDay;
    this.startDayOfWindow = startDayOfWindow !== undefined ? startDay : (startDay !== undefined ? startDay - 1 : undefined);
    this.endDayOfWindow = endDayOfWindow !== undefined ? endDayOfWindow : (startDay !== undefined ? startDay + 1 : undefined);;
    this.scheduledEvent = scheduledEvent;
  }

  getName() {
    return this.scheduledEvent.getName();
  }

}

/*
 * A Day represents a day on the timeline and the events that occurred on that day.
 */
export class TimelineDay {
  day: number;
  events: TimelineInstance[] = [];

  constructor(day: number) {
    this.day = day;
  }

  getEventInstances() : EventInstance[] {
    let result = this.events.filter(event => event instanceof EventInstance) as EventInstance[];
    return result;
  }

  getPeriodInstances() {
    return this.events.filter(event => event instanceof(PeriodInstance)) as PeriodInstance[];
  }}


  // Used Period instead of Phase so delete the following...
// /*
//  * A PhaseOccurrence represents a phase of the study that occurred on the timeline.
//  */
// export class PhaseOccurrence {
//   name: string;
//   startDay: number;
//   endDay: number;
//   startEvent: EventInstance;

//   constructor(name: string, startEvent: EventInstance, startDay: number, endDay: number) {
//     this.name = name;
//     this.startDay = startDay;
//     this.endDay = endDay;
//   }

//   getEvents() {
//     return this.startEvent;
//   } 
// }



import { Event, Day } from "../../../playground/src/StudyConfiguration/language/gen/index";

/*
 * A ScheduledEvent is a wrapper around an Event from the StudyConfiguration language.
 * It provides a simplified interface for the simulator and allows for the same Event to be scheduled multiple times.
 */
export class ScheduledEvent {
  event: Event;
  
  constructor(event: Event) {
    this.event = event;
  }

  day():number {
    let day = this.event.schedule.eventStart as Day;
    return day.startDay;
  }

  name():string {
    return this.event.name;
  } 

  dependency(): string {
    return null;
  }
}


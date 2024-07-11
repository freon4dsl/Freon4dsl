
import { Period } from "../../language/gen/index";
import { ScheduledEvent } from "./ScheduledEvent";

export class ScheduledPeriod {
  configuredPeriod: Period;
  private scheduledEvents: ScheduledEvent[] = [];

  constructor (configuredPeriod: Period) {
    this.configuredPeriod = configuredPeriod;
    this.scheduledEvents = configuredPeriod.events.map(event => {return new ScheduledEvent(event)});
  }

  getScheduledEvent(eventName: string) {
    return this.scheduledEvents.find(se => se.getName() === eventName);
  }

  getAllScheduledEvents() {
    return this.scheduledEvents;
  }

  getName() {
    return this.configuredPeriod.freId();
  }

}
import { Sim, Entity, Event, Buffer, Facility, Store, argCheck } from './lib/sim.js';
import { DataSeries, TimeSeries, Population } from './lib/stats.js';
import { Request } from './lib/request.js';
import { PQueue, Queue } from './lib/queues.js';
import { Random } from './lib/random.js';
import { Model } from './lib/model.js';

export { Sim, Entity, Event, Buffer, Facility, Store };
export { DataSeries, TimeSeries, Population };
export { Request };
export { PQueue, Queue, argCheck };
export { Random };
export { Model };

if (typeof window !== 'undefined') {
  window.Sim = {
    argCheck: argCheck,
    Buffer: Buffer,
    DataSeries: DataSeries,
    Entity: Entity,
    Event: Event,
    Facility: Facility,
    Model: Model,
    PQueue: PQueue,
    Population: Population,
    Queue: Queue,
    Random: Random,
    Request: Request,
    Sim: Sim,
    Store: Store,
    TimeSeries: TimeSeries
  };
}

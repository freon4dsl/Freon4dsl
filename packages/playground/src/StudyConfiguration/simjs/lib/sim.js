import { PQueue, Queue } from './queues.js';
import { Population } from './stats.js';
import { Request } from './request.js';
import { Model } from './model.js';

function argCheck(found, expMin, expMax) {
  if (found.length < expMin || found.length > expMax) {   // argCheck
    throw new Error('Incorrect number of arguments');   // argCheck
  }   // argCheck


  for (let i = 0; i < found.length; i++) {   // argCheck

    if (!arguments[i + 3] || !found[i]) continue;   // argCheck

//    print("TEST " + found[i] + " " + arguments[i + 3]   // argCheck
//    + " " + (found[i] instanceof Event)   // argCheck
//    + " " + (found[i] instanceof arguments[i + 3])   // argCheck
//    + "\n");   // ARG CHECK


    if (!(found[i] instanceof arguments[i + 3])) {   // argCheck
      throw new Error(`parameter ${i + 1} is of incorrect type.`);   // argCheck
    }   // argCheck
  }   // argCheck
}   // argCheck

class Sim {
  constructor() {
    this.simTime = 0;
    this.entities = [];
    this.queue = new PQueue();
    this.endTime = 0;
    this.entityId = 1;
  }

  time() {
    return this.simTime;
  }

  sendMessage() {
    const sender = this.source;

    const message = this.msg;

    const entities = this.data;

    const sim = sender.sim;

    if (!entities) {
            // send to all entities
      for (let i = sim.entities.length - 1; i >= 0; i--) {
        const entity = sim.entities[i];

        if (entity === sender) continue;
        if (entity.onMessage) entity.onMessage(sender, message);
      }
    } else if (entities instanceof Array) {
      for (let i = entities.length - 1; i >= 0; i--) {
        const entity = entities[i];

        if (entity === sender) continue;
        if (entity.onMessage) entity.onMessage(sender, message);
      }
    } else if (entities.onMessage) {
      entities.onMessage(sender, message);
    }
  }

  addEntity(Klass, name, ...args) {
        // Verify that prototype has start function
    if (!Klass.prototype.start) {  // ARG CHECK
      throw new Error(`Entity class ${Klass.name} must have start() function defined`);
    }

    const entity = new Klass(this, name);

    this.entities.push(entity);

    entity.start(...args);

    return entity;
  }

  simulate(endTime, maxEvents) {
        // argCheck(arguments, 1, 2);
    if (!maxEvents) { maxEvents = Math.Infinity; }
    let events = 0;

    while (true) {  // eslint-disable-line no-constant-condition
      events++;
      if (events > maxEvents) return false;

            // Get the earliest event
      const ro = this.queue.remove();

            // If there are no more events, we are done with simulation here.
      if (ro === null) break;

            // Uh oh.. we are out of time now
      if (ro.deliverAt > endTime) break;

            // Advance simulation time
      this.simTime = ro.deliverAt;

            // If this event is already cancelled, ignore
      if (ro.cancelled) continue;

      ro.deliver();
    }

    this.finalize();
    return true;
  }

  step() {
    while (true) {  // eslint-disable-line no-constant-condition
      const ro = this.queue.remove();

      if (ro === null) return false;
      this.simTime = ro.deliverAt;
      if (ro.cancelled) continue;
      ro.deliver();
      break;
    }
    return true;
  }

  finalize() {
    for (let i = 0; i < this.entities.length; i++) {

      if (this.entities[i].finalize) {
        this.entities[i].finalize();
      }
    }
  }

  setLogger(logger) {
    argCheck(arguments, 1, 1, Function);
    this.logger = logger;
  }

  log(message, entity) {
    argCheck(arguments, 1, 2);

    if (!this.logger) return;
    let entityMsg = '';

    if (typeof entity !== 'undefined') {
      if (entity.name) {
        entityMsg = ` [${entity.name}]`;
      } else {
        entityMsg = ` [${entity.id}] `;
      }
    }
    this.logger(`${this.simTime.toFixed(6)}${entityMsg}   ${message}`);
  }
}

class Facility extends Model {
  constructor(name, discipline, servers, maxqlen) {
    super(name);
    argCheck(arguments, 1, 4);

    this.free = servers ? servers : 1;
    this.servers = servers ? servers : 1;
    this.maxqlen = (typeof maxqlen === 'undefined') ? -1 : 1 * maxqlen;

    switch (discipline) {

    case Facility.LCFS:
      this.use = this.useLCFS;
      this.queue = new Queue();
      break;
    case Facility.PS:
      this.use = this.useProcessorSharing;
      this.queue = [];
      break;
    case Facility.FCFS:
    default:
      this.use = this.useFCFS;
      this.freeServers = new Array(this.servers);
      this.queue = new Queue();
      for (let i = 0; i < this.freeServers.length; i++) {

        this.freeServers[i] = true;
      }
    }

    this.stats = new Population();
    this.busyDuration = 0;
  }

  reset() {
    this.queue.reset();
    this.stats.reset();
    this.busyDuration = 0;
  }

  systemStats() {
    return this.stats;
  }

  queueStats() {
    return this.queue.stats;
  }

  usage() {
    return this.busyDuration;
  }

  finalize(timestamp) {
    argCheck(arguments, 1, 1);

    this.stats.finalize(timestamp);
    this.queue.stats.finalize(timestamp);
  }

  useFCFS(duration, ro) {
    argCheck(arguments, 2, 2);
    if ((this.maxqlen === 0 && !this.free)
                || (this.maxqlen > 0 && this.queue.size() >= this.maxqlen)) {
      ro.msg = -1;
      ro.deliverAt = ro.entity.time();
      ro.entity.sim.queue.insert(ro);
      return;
    }

    ro.duration = duration;
    const now = ro.entity.time();

    this.stats.enter(now);
    this.queue.push(ro, now);
    this.useFCFSSchedule(now);
  }

  useFCFSSchedule(timestamp) {
    argCheck(arguments, 1, 1);

    while (this.free > 0 && !this.queue.empty()) {
      const ro = this.queue.shift(timestamp);

      if (ro.cancelled) {
        continue;
      }
      for (let i = 0; i < this.freeServers.length; i++) {

        if (this.freeServers[i]) {
          this.freeServers[i] = false;
          ro.msg = i;
          break;
        }
      }

      this.free --;
      this.busyDuration += ro.duration;

            // cancel all other reneging requests
      ro.cancelRenegeClauses();

      const newro = new Request(this, timestamp, timestamp + ro.duration);

      newro.done(this.useFCFSCallback, this, ro);

      ro.entity.sim.queue.insert(newro);
    }
  }

  useFCFSCallback(ro) {
        // We have one more free server
    this.free ++;
    this.freeServers[ro.msg] = true;

    this.stats.leave(ro.scheduledAt, ro.entity.time());

        // if there is someone waiting, schedule it now
    this.useFCFSSchedule(ro.entity.time());

        // restore the deliver function, and deliver
    ro.deliver();

  }

  useLCFS(duration, ro) {
    argCheck(arguments, 2, 2);

        // if there was a running request..
    if (this.currentRO) {
      this.busyDuration += (this.currentRO.entity.time() - this.currentRO.lastIssued);
            // calcuate the remaining time
      this.currentRO.remaining = (
          this.currentRO.deliverAt - this.currentRO.entity.time());
            // preempt it..
      this.queue.push(this.currentRO, ro.entity.time());
    }

    this.currentRO = ro;
        // If this is the first time..
    if (!ro.saved_deliver) {
      ro.cancelRenegeClauses();
      ro.remaining = duration;
      ro.saved_deliver = ro.deliver;
      ro.deliver = this.useLCFSCallback;

      this.stats.enter(ro.entity.time());
    }

    ro.lastIssued = ro.entity.time();

        // schedule this new event
    ro.deliverAt = ro.entity.time() + duration;
    ro.entity.sim.queue.insert(ro);
  }

  useLCFSCallback() {
    const facility = this.source;

    if (this !== facility.currentRO) return;
    facility.currentRO = null;

        // stats
    facility.busyDuration += (this.entity.time() - this.lastIssued);
    facility.stats.leave(this.scheduledAt, this.entity.time());

        // deliver this request
    this.deliver = this.saved_deliver;
    delete this.saved_deliver;
    this.deliver();

        // see if there are pending requests
    if (!facility.queue.empty()) {
      const obj = facility.queue.pop(this.entity.time());

      facility.useLCFS(obj.remaining, obj);
    }
  }

  useProcessorSharing(duration, ro) {
    argCheck(arguments, 2, 2, null, Request);
    ro.duration = duration;
    ro.cancelRenegeClauses();
    this.stats.enter(ro.entity.time());
    this.useProcessorSharingSchedule(ro, true);
  }

  useProcessorSharingSchedule(ro, isAdded) {
    const current = ro.entity.time();

    const size = this.queue.length;

    const multiplier = isAdded ? ((size + 1.0) / size) : ((size - 1.0) / size);

    const newQueue = [];

    if (this.queue.length === 0) {
      this.lastIssued = current;
    }

    for (let i = 0; i < size; i++) {

      const ev = this.queue[i];

      if (ev.ro === ro) {
        continue;
      }
      const newev = new Request(
          this, current, current + (ev.deliverAt - current) * multiplier);

      newev.ro = ev.ro;
      newev.source = this;
      newev.deliver = this.useProcessorSharingCallback;
      newQueue.push(newev);

      ev.cancel();
      ro.entity.sim.queue.insert(newev);
    }

        // add this new request
    if (isAdded) {
      const newev = new Request(
          this, current, current + ro.duration * (size + 1));

      newev.ro = ro;
      newev.source = this;
      newev.deliver = this.useProcessorSharingCallback;
      newQueue.push(newev);

      ro.entity.sim.queue.insert(newev);
    }

    this.queue = newQueue;

        // usage statistics
    if (this.queue.length === 0) {
      this.busyDuration += (current - this.lastIssued);
    }
  }

  useProcessorSharingCallback() {
    const fac = this.source;

    if (this.cancelled) return;
    fac.stats.leave(this.ro.scheduledAt, this.ro.entity.time());

    fac.useProcessorSharingSchedule(this.ro, false);
    this.ro.deliver();
  }
}

Facility.FCFS = 1;
Facility.LCFS = 2;
Facility.PS = 3;
Facility.NumDisciplines = 4;

class Buffer extends Model {
  constructor(name, capacity, initial) {
    super(name);
    argCheck(arguments, 2, 3);

    this.capacity = capacity;
    this.available = (typeof initial === 'undefined') ? 0 : initial;
    this.putQueue = new Queue();
    this.getQueue = new Queue();
  }

  current() {
    return this.available;
  }

  size() {
    return this.capacity;
  }

  get(amount, ro) {
    argCheck(arguments, 2, 2);

    if (this.getQueue.empty()
                && amount <= this.available) {
      this.available -= amount;

      ro.deliverAt = ro.entity.time();
      ro.entity.sim.queue.insert(ro);

      this.getQueue.passby(ro.deliverAt);

      this.progressPutQueue();

      return;
    }
    ro.amount = amount;
    this.getQueue.push(ro, ro.entity.time());
  }

  put(amount, ro) {
    argCheck(arguments, 2, 2);

    if (this.putQueue.empty()
                && (amount + this.available) <= this.capacity) {
      this.available += amount;

      ro.deliverAt = ro.entity.time();
      ro.entity.sim.queue.insert(ro);

      this.putQueue.passby(ro.deliverAt);

      this.progressGetQueue();

      return;
    }

    ro.amount = amount;
    this.putQueue.push(ro, ro.entity.time());
  }

  progressGetQueue() {
    let obj;

    while (obj = this.getQueue.top()) {  // eslint-disable-line no-cond-assign
            // if obj is cancelled.. remove it.
      if (obj.cancelled) {
        this.getQueue.shift(obj.entity.time());
        continue;
      }

            // see if this request can be satisfied
      if (obj.amount <= this.available) {
                // remove it..
        this.getQueue.shift(obj.entity.time());
        this.available -= obj.amount;
        obj.deliverAt = obj.entity.time();
        obj.entity.sim.queue.insert(obj);
      } else {
                // this request cannot be satisfied
        break;
      }
    }
  }

  progressPutQueue() {
    let obj;

    while (obj = this.putQueue.top()) {  // eslint-disable-line no-cond-assign
            // if obj is cancelled.. remove it.
      if (obj.cancelled) {
        this.putQueue.shift(obj.entity.time());
        continue;
      }

            // see if this request can be satisfied
      if (obj.amount + this.available <= this.capacity) {
                // remove it..
        this.putQueue.shift(obj.entity.time());
        this.available += obj.amount;
        obj.deliverAt = obj.entity.time();
        obj.entity.sim.queue.insert(obj);
      } else {
                // this request cannot be satisfied
        break;
      }
    }
  }

  putStats() {
    return this.putQueue.stats;
  }

  getStats() {
    return this.getQueue.stats;
  }
}

class Store extends Model {
  constructor(capacity, name = null) {
    argCheck(arguments, 1, 2);
    super(name);

    this.capacity = capacity;
    this.objects = [];
    this.putQueue = new Queue();
    this.getQueue = new Queue();
  }

  current() {
    return this.objects.length;
  }

  size() {
    return this.capacity;
  }

  get(filter, ro) {
    argCheck(arguments, 2, 2);

    if (this.getQueue.empty() && this.current() > 0) {
      let found = false;

      let obj;

            // TODO: refactor this code out
            // it is repeated in progressGetQueue
      if (filter) {
        for (let i = 0; i < this.objects.length; i++) {

          obj = this.objects[i];
          if (filter(obj)) {
            found = true;
            this.objects.splice(i, 1);
            break;
          }
        }
      } else {
        obj = this.objects.shift();
        found = true;
      }

      if (found) {
        this.available --;

        ro.msg = obj;
        ro.deliverAt = ro.entity.time();
        ro.entity.sim.queue.insert(ro);

        this.getQueue.passby(ro.deliverAt);

        this.progressPutQueue();

        return;
      }
    }

    ro.filter = filter;
    this.getQueue.push(ro, ro.entity.time());
  }

  put(obj, ro) {
    argCheck(arguments, 2, 2);

    if (this.putQueue.empty() && this.current() < this.capacity) {
      this.available ++;

      ro.deliverAt = ro.entity.time();
      ro.entity.sim.queue.insert(ro);

      this.putQueue.passby(ro.deliverAt);
      this.objects.push(obj);

      this.progressGetQueue();

      return;
    }

    ro.obj = obj;
    this.putQueue.push(ro, ro.entity.time());
  }

  progressGetQueue() {
    let ro;

    while (ro = this.getQueue.top()) {  // eslint-disable-line no-cond-assign
      // if obj is cancelled.. remove it.
      if (ro.cancelled) {
        this.getQueue.shift(ro.entity.time());
        continue;
      }

      // see if this request can be satisfied
      if (this.current() > 0) {
        const filter = ro.filter;

        let found = false;

        let obj;

        if (filter) {
          for (let i = 0; i < this.objects.length; i++) {

            obj = this.objects[i];
            if (filter(obj)) {  // eslint-disable-line max-depth
              found = true;
              this.objects.splice(i, 1);
              break;
            }
          }
        } else {
          obj = this.objects.shift();
          found = true;
        }

        if (found) {
                    // remove it..
          this.getQueue.shift(ro.entity.time());
          this.available --;

          ro.msg = obj;
          ro.deliverAt = ro.entity.time();
          ro.entity.sim.queue.insert(ro);
        } else {
          break;
        }

      } else {
                // this request cannot be satisfied
        break;
      }
    }
  }

  progressPutQueue() {
    let ro;

    while (ro = this.putQueue.top()) {  // eslint-disable-line no-cond-assign
            // if obj is cancelled.. remove it.
      if (ro.cancelled) {
        this.putQueue.shift(ro.entity.time());
        continue;
      }

            // see if this request can be satisfied
      if (this.current() < this.capacity) {
                // remove it..
        this.putQueue.shift(ro.entity.time());
        this.available ++;
        this.objects.push(ro.obj);
        ro.deliverAt = ro.entity.time();
        ro.entity.sim.queue.insert(ro);
      } else {
        // this request cannot be satisfied
        break;
      }
    }
  }

  putStats() {
    return this.putQueue.stats;
  }

  getStats() {
    return this.getQueue.stats;
  }
}

class Event extends Model {
  constructor(name) {
    super(name);
    argCheck(arguments, 0, 1);

    this.waitList = [];
    this.queue = [];
    this.isFired = false;
  }

  addWaitList(ro) {
    argCheck(arguments, 1, 1);

    if (this.isFired) {
      ro.deliverAt = ro.entity.time();
      ro.entity.sim.queue.insert(ro);
      return;
    }
    this.waitList.push(ro);
  }

  addQueue(ro) {
    argCheck(arguments, 1, 1);

    if (this.isFired) {
      ro.deliverAt = ro.entity.time();
      ro.entity.sim.queue.insert(ro);
      return;
    }
    this.queue.push(ro);
  }

  fire(keepFired) {
    argCheck(arguments, 0, 1);

    if (keepFired) {
      this.isFired = true;
    }

        // Dispatch all waiting entities
    const tmpList = this.waitList;

    this.waitList = [];
    for (let i = 0; i < tmpList.length; i++) {

      tmpList[i].deliver();
    }

        // Dispatch one queued entity
    const lucky = this.queue.shift();

    if (lucky) {
      lucky.deliver();
    }
  }

  clear() {
    this.isFired = false;
  }
}

class Entity extends Model {
  constructor(sim, name) {
    super(name);
    this.sim = sim;
  }

  time() {
    return this.sim.time();
  }

  setTimer(duration) {
    argCheck(arguments, 1, 1);

    const ro = new Request(
              this,
              this.sim.time(),
              this.sim.time() + duration);

    this.sim.queue.insert(ro);
    return ro;
  }

  waitEvent(event) {
    argCheck(arguments, 1, 1, Event);

    const ro = new Request(this, this.sim.time(), 0);

    ro.source = event;
    event.addWaitList(ro);
    return ro;
  }

  queueEvent(event) {
    argCheck(arguments, 1, 1, Event);

    const ro = new Request(this, this.sim.time(), 0);

    ro.source = event;
    event.addQueue(ro);
    return ro;
  }

  useFacility(facility, duration) {
    argCheck(arguments, 2, 2, Facility);

    const ro = new Request(this, this.sim.time(), 0);

    ro.source = facility;
    facility.use(duration, ro);
    return ro;
  }

  putBuffer(buffer, amount) {
    argCheck(arguments, 2, 2, Buffer);

    const ro = new Request(this, this.sim.time(), 0);

    ro.source = buffer;
    buffer.put(amount, ro);
    return ro;
  }

  getBuffer(buffer, amount) {
    argCheck(arguments, 2, 2, Buffer);

    const ro = new Request(this, this.sim.time(), 0);

    ro.source = buffer;
    buffer.get(amount, ro);
    return ro;
  }

  putStore(store, obj) {
    argCheck(arguments, 2, 2, Store);

    const ro = new Request(this, this.sim.time(), 0);

    ro.source = store;
    store.put(obj, ro);
    return ro;
  }

  getStore(store, filter) {
    argCheck(arguments, 1, 2, Store, Function);

    const ro = new Request(this, this.sim.time(), 0);

    ro.source = store;
    store.get(filter, ro);
    return ro;
  }

  send(message, delay, entities) {
    argCheck(arguments, 2, 3);

    const ro = new Request(this.sim, this.time(), this.time() + delay);

    ro.source = this;
    ro.msg = message;
    ro.data = entities;
    ro.deliver = this.sim.sendMessage;

    this.sim.queue.insert(ro);
  }

  log(message) {
    argCheck(arguments, 1, 1);

    this.sim.log(message, this);
  }
}

export { Sim, Facility, Buffer, Store, Event, Entity, argCheck };

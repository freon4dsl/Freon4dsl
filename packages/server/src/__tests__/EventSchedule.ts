export class EventSchedule {

  // This is just a hack to prove typescript classes can be passed to the scheduler
  
  getVisits() {
    let visits = [
    { name: 'Visit 1', day: 7, repetitions: 0, minWindow: 0, maxWindow: 0, dependency: null },
    { name: 'Visit 2', day: 10, repetitions: 2, minWindow: 2, maxWindow: 4, dependency: null },
    { name: 'Visit 3', day: null, repetitions: 0, minWindow: 2, maxWindow: 2, dependency: 'Visit 2' }
    // Add more visits as needed
    ];
    return visits;
  }
}
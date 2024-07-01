import { argCheck } from './sim.js';

class DataSeries {
  constructor(name) {
    this.name = name;
    this.reset();
  }

  reset() {
    this.Count = 0;
    this.W = 0.0;
    this.A = 0.0;
    this.Q = 0.0;
    this.Max = -Infinity;
    this.Min = Infinity;
    this.Sum = 0;

    if (this.histogram) {
      for (let i = 0; i < this.histogram.length; i++) {

        this.histogram[i] = 0;
      }
    }
  }

  setHistogram(lower, upper, nbuckets) {
    argCheck(arguments, 3, 3);

    this.hLower = lower;
    this.hUpper = upper;
    this.hBucketSize = (upper - lower) / nbuckets;
    this.histogram = new Array(nbuckets + 2);
    for (let i = 0; i < this.histogram.length; i++) {

      this.histogram[i] = 0;
    }
  }

  getHistogram() {
    return this.histogram;
  }

  record(value, weight) {
    argCheck(arguments, 1, 2);

    const w = (typeof weight === 'undefined') ? 1 : weight;

        // document.write("Data series recording " + value + " (weight = " + w + ")\n");

    if (value > this.Max) this.Max = value;
    if (value < this.Min) this.Min = value;
    this.Sum += value;
    this.Count ++;
    if (this.histogram) {
      if (value < this.hLower) {
        this.histogram[0] += w;
      } else if (value > this.hUpper) {
        this.histogram[this.histogram.length - 1] += w;
      } else {
        const index = Math.floor((value - this.hLower) / this.hBucketSize) + 1;

        this.histogram[index] += w;
      }
    }

        // Wi = Wi-1 + wi
    this.W = this.W + w;

    if (this.W === 0) {
      return;
    }

        // Ai = Ai-1 + wi/Wi * (xi - Ai-1)
    const lastA = this.A;

    this.A = lastA + (w / this.W) * (value - lastA);

        // Qi = Qi-1 + wi(xi - Ai-1)(xi - Ai)
    this.Q = this.Q + w * (value - lastA) * (value - this.A);
        // print("\tW=" + this.W + " A=" + this.A + " Q=" + this.Q + "\n");
  }

  count() {
    return this.Count;
  }

  min() {
    return this.Min;
  }

  max() {
    return this.Max;
  }

  range() {
    return this.Max - this.Min;
  }

  sum() {
    return this.Sum;
  }

  sumWeighted() {
    return this.A * this.W;
  }

  average() {
    return this.A;
  }

  variance() {
    return this.Q / this.W;
  }

  deviation() {
    return Math.sqrt(this.variance());
  }
}

class TimeSeries {
  constructor(name) {
    this.dataSeries = new DataSeries(name);
  }

  reset() {
    this.dataSeries.reset();
    this.lastValue = NaN;
    this.lastTimestamp = NaN;
  }

  setHistogram(lower, upper, nbuckets) {
    argCheck(arguments, 3, 3);
    this.dataSeries.setHistogram(lower, upper, nbuckets);
  }

  getHistogram() {
    return this.dataSeries.getHistogram();
  }

  record(value, timestamp) {
    argCheck(arguments, 2, 2);

    if (!isNaN(this.lastTimestamp)) {
      this.dataSeries.record(this.lastValue, timestamp - this.lastTimestamp);
    }

    this.lastValue = value;
    this.lastTimestamp = timestamp;
  }

  finalize(timestamp) {
    argCheck(arguments, 1, 1);

    this.record(NaN, timestamp);
  }

  count() {
    return this.dataSeries.count();
  }

  min() {
    return this.dataSeries.min();
  }

  max() {
    return this.dataSeries.max();
  }

  range() {
    return this.dataSeries.range();
  }

  sum() {
    return this.dataSeries.sum();
  }

  average() {
    return this.dataSeries.average();
  }

  deviation() {
    return this.dataSeries.deviation();
  }

  variance() {
    return this.dataSeries.variance();
  }
}

class Population {
  constructor(name) {
    this.name = name;
    this.population = 0;
    this.sizeSeries = new TimeSeries();
    this.durationSeries = new DataSeries();
  }

  reset() {
    this.sizeSeries.reset();
    this.durationSeries.reset();
    this.population = 0;
  }

  enter(timestamp) {
    argCheck(arguments, 1, 1);

    this.population ++;
    this.sizeSeries.record(this.population, timestamp);
  }

  leave(arrivalAt, leftAt) {
    argCheck(arguments, 2, 2);

    this.population --;
    this.sizeSeries.record(this.population, leftAt);
    this.durationSeries.record(leftAt - arrivalAt);
  }

  current() {
    return this.population;
  }

  finalize(timestamp) {
    this.sizeSeries.finalize(timestamp);
  }
}

export { DataSeries, TimeSeries, Population };

import * as metrics from './metrics';

export class Timer {

  private start: [number, number];
  private name: string;
  private checkpoints: { [key: string]: number };
  private tags: { [key: string]: any };

  constructor(name: string, tags: { [key: string]: any } = {}) {
    this.start = process.hrtime();
    this.name = name;
    this.tags = tags;
    this.checkpoints = {};
  }

  end(tags: { [key: string]: any } = {}) {
    return this.checkpoint('end', tags);
  }

  checkpoint(key: string, tags: { [key: string]: any } = {}) {
    const elapsed = process.hrtime(this.start);
    const ms = elapsed[0] * 1e3 + elapsed[1] / 1e6;
    this.checkpoints[key] = ms;

    let k = this.name;
    if (key !== 'end') {
      k = `${this.name}.${key}`;
    }

    metrics.histogram(k, ms, Object.assign(tags, this.tags));

    return this;
  }

  count(key: string, count: number, tags: { [key: string]: any } = {}) {
    const k = `${this.name}.${key}`;
    metrics.count(k, count, Object.assign(tags, this.tags));
    return this;
  }
}

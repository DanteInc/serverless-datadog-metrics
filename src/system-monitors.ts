import * as os from 'os';

import * as metrics from './metrics';

let startTime;
let startUsage;

export const start = (options: any = {}) => {
  metrics.gauge('node.process.uptime', process.uptime());

  if (options.advanced) {
    metrics.gauge('node.os.uptime', os.uptime());
  }

  startTime = process.hrtime();
  startUsage = process.cpuUsage();
};

export const stop = (options: any = {}) => {
  mem(options);
  cpu(options);
};

const mem = (options: any) => {
  const mem = process.memoryUsage();
  const used = mem.heapUsed;
  const total = mem.heapTotal;

  if (options.advanced) {
    metrics.gauge('node.mem.rss', mem.rss);
    metrics.gauge('node.mem.heap.free', total - used);
    metrics.gauge('node.mem.heap.used', used);
    metrics.gauge('node.mem.heap.total', total);
  }

  metrics.gauge('node.mem.heap.utilization', used / total);

  const freemem = os.freemem();
  const totalmem = os.totalmem();
  const usedmem = totalmem - freemem;

  if (options.advanced) {
    metrics.gauge('node.mem.os.free', freemem);
    metrics.gauge('node.mem.os.used', usedmem);
    metrics.gauge('node.mem.os.total', totalmem);
  }

  metrics.gauge('node.mem.os.utilization', usedmem / totalmem);
};

const cpu = (options: any) => {
  const elapTime = process.hrtime(startTime);
  const elapUsage = process.cpuUsage(startUsage);

  const elapTimeMS = elapTime[0] * 1e3 + elapTime[1] / 1e6;
  const elapUserMS = elapUsage.user / 1e3;
  const elapSystMS = elapUsage.system / 1e3;
  const cpuPercent = (elapUserMS + elapSystMS) / elapTimeMS;

  if (options.advanced) {
    metrics.gauge('node.cpu.elapsed.user', elapUserMS);
    metrics.gauge('node.cpu.elapsed.system', elapSystMS);
  }

  metrics.gauge('node.cpu.utilization', cpuPercent);

  if (options.advanced) {
    const loadavg = os.loadavg();
    metrics.gauge('node.os.loadavg.1m', loadavg[0]);
    metrics.gauge('node.os.loadavg.5m', loadavg[1]);
    metrics.gauge('node.os.loadavg.15m', loadavg[2]);
  }
};


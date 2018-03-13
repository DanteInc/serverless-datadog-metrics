import * as metrics from './metrics';
import * as systemMonitors from './system-monitors';
import * as httpMonitor from './http-monitor';

import { Timer } from './Timer';

export const monitor = (handler: Function, tags:any = {}, options = { advanced: process.env.MONITOR_ADVANCED === 'true' }): Function => {

  metrics.init(tags);
  httpMonitor.patch();
  metrics.count('aws.lambda.coldstart.count');

  return (event, context, cb): void => {

    const timer = new Timer('aws.lambda.handler');
    systemMonitors.start(options);

    return handler(event, context, (err, resp) => {
      if (err) {
        metrics.error('aws.lambda.handler', err);
        metrics.check('aws.lambda.check', 1); // warning
      } else {
        metrics.check('aws.lambda.check', 0); // ok
      }

      systemMonitors.stop(options);
      timer.end();

      cb(err, resp);
    });
  };
};

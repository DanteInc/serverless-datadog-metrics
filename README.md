# serverless-datadog-metrics

This library logs useful metrics from AWS Lambda functions, so that they can be accumulated via Datadog's AWS Lambda integration. See _Related Documents_ below.

1. [Confilgure Datadog AWS Integration](https://docs.datadoghq.com/integrations/amazon_web_services/#setup)

> TIP: Add an account tag to identify metrics per AWS account: `account:<human readable name>`

2. Install library:

> `npm install --save serverless-datadog-metrics`

3. Integrate monitoring:

_Wrap the handler function._

> ```
> const monitor = require('serverless-data-metrics').monitor;
>
> exports.handler = monitor(
>   function(event, context, callback) {
>     // . . .
>     callback();
>   }
> )
> ```

_Initialize some additional environment variables._

> ```
>  environment:
>    ACCOUNT_NAME: ${opt:account}
>    SERVERLESS_STAGE: ${opt:stage}
>    SERVERLESS_PROJECT: ${self:service}
>    MONITOR_ADVANCED: true
> ```

4. Record custom metrics as needed:

> ```
> const metrics = require('serverless-data-metrics');
>
> metrics.count('custom.count', 1);
> metrics.gauge('custom.gauge', 2);
> metrics.histogram('custom.histogram', 3);
> metrics.check('custom.check', 0);
> metrics.error(err);
>
> const timer = new metrics.Timer('custom.timer');
> sleep(1);
> timer.checkpoint('cp1');
> sleep(1);
> timer.end();
> ```

## Metrics
These metrics are automatically collected.

* Lambda
   * aws.lambda.coldstart.count (count)
   * aws.lambda.handler (histogram)
   * aws.lambda.handler.error.count (count)
   * aws.lambda.check (check)
* Outbound HTTP Requests
   * http.request (histogram)
   * http.request.4xxerror (count)
   * http.request.5xxerror (count)
* System
   * node.process.uptime (gauge)
   * node.mem.heap.utilization (gauge)
   * node.mem.os.utilization (gauge)
   * node.cpu.utilization (gauge)
   * Optional (`process.env.MONITOR_ADVANCED === 'true'`)
      * node.os.uptime (gauge)
      * node.mem.rss (gauge)
      * node.mem.heap.free (gauge)
      * node.mem.heap.used (gauge)
      * node.mem.heap.total (gauge)
      * node.mem.os.free (gauge)
      * node.mem.os.used (gauge)
      * node.mem.os.total (gauge)
      * node.cpu.elapsed.user (gauge)
      * node.cpu.elapsed.system (gauge)
      * node.os.loadavg.1m (gauge)
      * node.os.loadavg.5m (gauge)
      * node.os.loadavg.15m (gauge)

## Related Documentation
* [How to monitor Lambda functions](https://www.datadoghq.com/blog/how-to-monitor-lambda-functions)
* [Monitoring Lambda Functions with Datadog](https://www.datadoghq.com/blog/monitoring-lambda-functions-datadog)
* [Datadog AWS Lambda Integration](http://docs.datadoghq.com/integrations/awslambda)

import * as debug from 'debug';

import { Timer } from './Timer';

const http = require('http');

let original;

export const patch = () => {
  /* istanbul ignore next */
  if (!original) {
    original = http.request;
    http.request = wrap(http.request);
  }
};

export const unpatch = () => {
  /* istanbul ignore next */
  if (original) {
    http.request = original;
    original = null;
  }
};

const wrap = (original) => {
  return function () {
    /* istanbul ignore next: NA with Replay */
    const host = arguments[0].hostname ? arguments[0].hostname : arguments[0].host;

    const timer = new Timer('http.request', {
      'http-host': host,
      // 'http-path': arguments[0].path,  // cardinality too high
      'http-method': arguments[0].method,
    });

    const trace = debug('http-trace:' + host);

    trace('request-before: %j', arguments);

    const result = original.apply(this, arguments);

    /* istanbul ignore next: NA with Replay */
    result
      .on('connect', (response, socket, head) => {
        trace('request-connect');
      });

    /* istanbul ignore next: NA with Replay */
    result
      .on('socket', (socket) => {
        trace('request-socket');

        socket
          .on('connect', () => {
            trace('socket-connect');
          })
          // .on("data", (chunk) => {
          //   trace('socket-data')
          // })
          .on('end', () => {
            trace('socket-end');
          })
          .on('close', () => {
            trace('socket-close: %j', timer);
          })
          .on('lookup', () => {
            trace('socket-lookup: ');
          })
          .on('timeout', () => {
            trace('socket-timeout');
          })
          .on('error', (err) => {
            trace('socket-error: %s', err);
          })
          .on('drain', () => {
            trace('socket-drain');
          })
          ;
      });

    result
      .on('response', (response) => {
        trace('response-start: %s, %j', response.statusCode, response.headers);

        const tags = {
          statusCode: response.statusCode,
          statusMessage: response.statusMessage,
        };

        recordError(response, tags, timer);

        response.on('end', () => {
          timer.end(tags);

          trace('response-end');
        });
      })
      ;

    return result;
  };
};

export const recordError = (response: any, tags: any, timer: Timer) => {
  let e4xx = 0;
  let e5xx = 0;

  if (response.statusCode >= 400) {
    if (response.statusCode < 500) {
      e4xx = 1;
    } else {
      e5xx = 1;
    }
  }

  timer.count('4xxerror', e4xx, tags);
  timer.count('5xxerror', e5xx, tags);
};

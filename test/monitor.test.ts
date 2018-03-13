import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';

import * as metrics from '../src/metrics';
import * as httpMonitor from '../src/http-monitor';
import * as systemMonitors from '../src/system-monitors';

import { monitor } from '../src/monitor';

let sandbox;

describe('monitor.ts', () => {
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    delete process.env.MONITOR_ADVANCED;
    sandbox.restore();
  });

  it('init', () => {
    const init = sandbox.spy(metrics, 'init');
    const patch = sandbox.spy(httpMonitor, 'patch');
    const count = sandbox.spy(metrics, 'count');

    const f = monitor(sinon.spy(), { t1: 'v1' }, { advanced: false });

    expect(init.calledWith({ t1: 'v1' })).to.be.true;
    expect(patch.calledOnce).to.be.true;
    expect(count.calledOnce).to.be.true;
  });

  it('success', () => {
    const histogram = sandbox.spy(metrics, 'histogram');
    const check = sandbox.spy(metrics, 'check');
    const start = sandbox.spy(systemMonitors, 'start');
    const stop = sandbox.spy(systemMonitors, 'stop');

    const handler = (event, context, cb) => {
      cb();
    };

    process.env.MONITOR_ADVANCED = 'true';
    const f = monitor(handler);

    f({}, {}, (err, resp) => { });

    expect(histogram.calledWith('aws.lambda.handler')).to.be.true;
    expect(check.calledWith('aws.lambda.check', 0)).to.be.true;
    expect(start.calledWith({ advanced: true })).to.be.true;
    expect(stop.calledWith({ advanced: true })).to.be.true;
  });

  it('error', () => {
    const histogram = sandbox.spy(metrics, 'histogram');
    const check = sandbox.spy(metrics, 'check');
    const error = sandbox.spy(metrics, 'error');
    const start = sandbox.spy(systemMonitors, 'start');
    const stop = sandbox.spy(systemMonitors, 'stop');

    const handler = (event, context, cb) => {
      cb('error');
    };

    const f = monitor(handler, {}, { advanced: true });

    f({}, {}, (err, resp) => { });

    expect(histogram.calledWith('aws.lambda.handler')).to.be.true;
    expect(check.calledWith('aws.lambda.check', 1)).to.be.true;
    expect(error.calledWith('error', 'aws.lambda.handler')).to.be.true;
    expect(start.calledWith({ advanced: true })).to.be.true;
    expect(stop.calledWith({ advanced: true })).to.be.true;
  });
});
